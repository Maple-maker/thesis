import type { Request, Response } from "express";
import { z } from "zod";

const feedbackSchema = z.object({
  category: z.enum(["bug", "ux", "feature", "general"]),
  description: z.string().min(5).max(5000),
  steps: z.string().max(5000).optional().default(""),
  deviceInfo: z.string().max(500).optional().default("unknown"),
  appVersion: z.string().max(100).optional().default("unknown"),
  timestamp: z.string().optional(),
});

export type FeedbackPayload = z.infer<typeof feedbackSchema>;

const FEEDBACK_WEBHOOK_URL = process.env.FEEDBACK_WEBHOOK_URL;

export async function postFeedback(req: Request, res: Response) {
  const parsed = feedbackSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid feedback payload",
      details: parsed.error.flatten(),
    });
    return;
  }

  const payload: FeedbackPayload = {
    ...parsed.data,
    timestamp: parsed.data.timestamp || new Date().toISOString(),
  };

  // Log locally as a durable backup
  console.log(
    `[feedback] ${payload.category} | ${payload.deviceInfo} | v${payload.appVersion} | ${payload.description.slice(0, 120)}`
  );

  // Forward to Google Apps Script webhook (Google Sheet)
  if (FEEDBACK_WEBHOOK_URL) {
    try {
      const webhookRes = await fetch(FEEDBACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!webhookRes.ok) {
        console.error(
          `[feedback] Webhook returned ${webhookRes.status}: ${await webhookRes.text().catch(() => "?")}`
        );
        // Still return 200 to the client — feedback was logged locally
      }
    } catch (err) {
      console.error("[feedback] Webhook fetch failed:", err);
      // Don't fail the request — feedback is logged server-side
    }
  } else {
    console.warn("[feedback] FEEDBACK_WEBHOOK_URL not set — feedback logged to server only");
  }

  res.json({ ok: true, message: "Feedback received. Thank you!" });
}
