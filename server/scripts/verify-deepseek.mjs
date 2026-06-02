#!/usr/bin/env node
/**
 * Test DeepSeek key directly (no Thesis server). Run from server/:
 *   node scripts/verify-deepseek.mjs
 */
import "dotenv/config";

const key = process.env.DEEPSEEK_API_KEY?.trim();
if (!key || key === "PASTE_NEW_KEY_HERE") {
  console.error("Set DEEPSEEK_API_KEY in server/.env first.");
  process.exit(1);
}

console.log(`Key length: ${key.length}`);

const res = await fetch("https://api.deepseek.com/v1/models", {
  headers: { Authorization: `Bearer ${key}` },
});

const body = await res.text();
if (res.ok) {
  console.log("DeepSeek auth OK (200). Key is valid.");
  process.exit(0);
}

console.error(`DeepSeek auth failed (${res.status}):`, body.slice(0, 200));
process.exit(1);
