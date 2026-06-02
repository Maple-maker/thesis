import type { Request, Response } from "express";

import { buildMacroSnapshot } from "./tools/macro-snapshot.js";
import { fredConfigured } from "./tools/fred.js";

export async function getMacroSnapshot(_req: Request, res: Response) {
  try {
    const snapshot = await buildMacroSnapshot();
    res.json({
      ...snapshot,
      tools: {
        enabled: process.env.ASSISTANT_TOOLS !== "0",
        fredApiKey: fredConfigured(),
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Macro snapshot failed";
    res.status(502).json({ error: message });
  }
}
