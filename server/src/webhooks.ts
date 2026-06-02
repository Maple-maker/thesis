import type { Request, Response } from "express";

import { setUserPro } from "./entitlements.js";

/**
 * RevenueCat webhook, https://www.revenuecat.com/docs/webhooks
 * Set REVENUECAT_WEBHOOK_SECRET and verify Authorization header in production.
 */
export function postRevenueCatWebhook(req: Request, res: Response) {
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (secret) {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${secret}`) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
  }

  const body = req.body as {
    event?: {
      type?: string;
      app_user_id?: string;
    };
  };

  const userId = body.event?.app_user_id;
  const type = body.event?.type ?? "";

  if (!userId) {
    res.status(400).json({ error: "Missing app_user_id" });
    return;
  }

  const grantPro = [
    "INITIAL_PURCHASE",
    "RENEWAL",
    "UNCANCELLATION",
    "PRODUCT_CHANGE",
  ].includes(type);

  const revokePro = ["EXPIRATION", "CANCELLATION"].includes(type);

  if (grantPro) setUserPro(userId, true);
  if (revokePro) setUserPro(userId, false);

  res.json({ ok: true, userId, type, pro: grantPro });
}
