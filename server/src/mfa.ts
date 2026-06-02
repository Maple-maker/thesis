import type { Request, Response } from "express";
import { z } from "zod";
import * as crypto from "crypto";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

// ── TOTP (RFC 6238) using Node built-in crypto ─────────────────────────

function generateBase32Secret(bytes = 20): string {
  const buf = crypto.randomBytes(bytes);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let result = "";
  let bits = 0;
  let value = 0;
  for (let i = 0; i < buf.length; i++) {
    value = (value << 8) | buf[i];
    bits += 8;
    while (bits >= 5) {
      result += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) result += alphabet[(value << (5 - bits)) & 31];
  return result;
}

function base32Decode(secret: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of secret.toUpperCase().replace(/=+$/, "")) {
    const idx = alphabet.indexOf(char);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

function generateTotp(secret: string, timeStep = 30, digits = 6): string {
  const counter = Math.floor(Date.now() / 1000 / timeStep);
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigInt64BE(BigInt(counter), 0);

  const key = base32Decode(secret);
  const hmac = crypto.createHmac("sha1", key).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(binCode % 10 ** digits).padStart(digits, "0");
}

function verifyTotp(code: string, secret: string, window = 1): boolean {
  // Try current step ± window
  for (let offset = -window; offset <= window; offset++) {
    const counter = Math.floor(Date.now() / 1000 / 30) + offset;
    const counterBuf = Buffer.alloc(8);
    counterBuf.writeBigInt64BE(BigInt(counter), 0);
    const key = base32Decode(secret);
    const hmac = crypto.createHmac("sha1", key).update(counterBuf).digest();
    const off = hmac[hmac.length - 1] & 0x0f;
    const binCode =
      ((hmac[off] & 0x7f) << 24) |
      ((hmac[off + 1] & 0xff) << 16) |
      ((hmac[off + 2] & 0xff) << 8) |
      (hmac[off + 3] & 0xff);
    const generated = String(binCode % 1_000_000).padStart(6, "0");
    if (generated === code) return true;
  }
  return false;
}

function keyUri(userId: string, secret: string): string {
  return `otpauth://totp/Thesis:${encodeURIComponent(userId)}?secret=${secret}&issuer=Thesis&algorithm=SHA1&digits=6&period=30`;
}

// ── Persistence ────────────────────────────────────────────────────────
const DATA_DIR = path.resolve("data");
const MFA_PATH = path.join(DATA_DIR, "mfa-enrollments.json");

type MfaEnrollment = {
  userId: string;
  secret: string;
  enrolled: boolean;
  enrolledAt?: number;
  lastVerifiedAt?: number;
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadEnrollments(): Record<string, MfaEnrollment> {
  try {
    if (fs.existsSync(MFA_PATH)) return JSON.parse(fs.readFileSync(MFA_PATH, "utf-8"));
  } catch {}
  return {};
}

function saveEnrollments(data: Record<string, MfaEnrollment>) {
  ensureDataDir();
  fs.writeFileSync(MFA_PATH, JSON.stringify(data, null, 2));
}

// ── POST /v1/mfa/setup ────────────────────────────────────────────────
export async function postMfaSetup(req: Request, res: Response) {
  const parsed = z.object({ userId: z.string().min(8) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const { userId } = parsed.data;
  const enrollments = loadEnrollments();

  if (enrollments[userId]?.enrolled) {
    res.json({ enrolled: true, message: "MFA already set up" });
    return;
  }

  const secret = generateBase32Secret();
  const otpauth = keyUri(userId, secret);
  const qrDataUrl = await QRCode.toDataURL(otpauth);

  enrollments[userId] = { userId, secret, enrolled: false };
  saveEnrollments(enrollments);

  res.json({ enrolled: false, secret, otpauth, qrDataUrl });
}

// ── POST /v1/mfa/verify ───────────────────────────────────────────────
export async function postMfaVerify(req: Request, res: Response) {
  const parsed = z
    .object({ userId: z.string().min(8), code: z.string().length(6) })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const { userId, code } = parsed.data;
  const enrollments = loadEnrollments();
  const enrollment = enrollments[userId];

  if (!enrollment) {
    res.status(404).json({ error: "No MFA setup found. Call /v1/mfa/setup first." });
    return;
  }

  if (!verifyTotp(code, enrollment.secret)) {
    res.status(401).json({ verified: false, error: "Invalid code." });
    return;
  }

  enrollments[userId] = { ...enrollment, enrolled: true, enrolledAt: Date.now(), lastVerifiedAt: Date.now() };
  saveEnrollments(enrollments);

  res.json({ verified: true, enrolled: true, message: "MFA enabled." });
}

// ── POST /v1/mfa/challenge ────────────────────────────────────────────
export async function postMfaChallenge(req: Request, res: Response) {
  const parsed = z
    .object({ userId: z.string().min(8), code: z.string().length(6) })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const { userId, code } = parsed.data;
  const enrollments = loadEnrollments();
  const enrollment = enrollments[userId];

  if (!enrollment?.enrolled) {
    res.status(403).json({ verified: false, error: "MFA not set up." });
    return;
  }

  if (!verifyTotp(code, enrollment.secret)) {
    res.status(401).json({ verified: false, error: "Invalid code." });
    return;
  }

  enrollments[userId].lastVerifiedAt = Date.now();
  saveEnrollments(enrollments);

  res.json({ verified: true, message: "Challenge passed." });
}

// ── GET /v1/mfa/status ────────────────────────────────────────────────
export async function getMfaStatus(req: Request, res: Response) {
  const userId = req.query.userId as string;
  if (!userId) {
    res.status(400).json({ error: "Missing userId" });
    return;
  }
  const enrollment = loadEnrollments()[userId];
  res.json({
    enrolled: enrollment?.enrolled ?? false,
    enrolledAt: enrollment?.enrolledAt ?? null,
    lastVerifiedAt: enrollment?.lastVerifiedAt ?? null,
  });
}
