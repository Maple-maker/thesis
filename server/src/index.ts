import "dotenv/config";

import * as Sentry from "@sentry/node";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? "production",
    tracesSampleRate: 0.1,
  });
}

import { postChat } from "./chat.js";
import { postMemoryExtract } from "./memory-extract.js";
import { paceStatus } from "./llm.js";
import { seedDevProUsers } from "./entitlements.js";
import {
  postPlaidExchange,
  postPlaidLinkToken,
  postPlaidSync,
  postPlaidWebhook,
} from "./plaid.js";
import { postRevenueCatWebhook } from "./webhooks.js";
import { getMarketQuote, getMarketSearch } from "./market.js";
import { isMarketLiveSearchEnabled } from "./market-data-guard.js";
import { marketPlanSummary } from "./market-plan.js";
import { isPolygonConfigured, preferPolygonMarketData } from "./polygon-client.js";
import { getMacroSnapshot } from "./macro.js";
import { postThesisResearch } from "./thesis-research.js";
import { postDebate, getDebateJob } from "./llm-debate.js";
import { getMarketSentiment } from "./market-sentiment.js";
import { postCatalystResearch } from "./catalyst-research.js";
import { postFeedback } from "./feedback.js";
import { getMfaStatus, postMfaChallenge, postMfaSetup, postMfaVerify } from "./mfa.js";

const app = express();
const port = Number(process.env.PORT ?? 8787);

// Security headers
app.use(helmet());

// Request logging (dev: concise, prod: combined)
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// CORS — tighten in production
const corsOrigin = process.env.CORS_ORIGIN?.trim();
app.use(
  cors({
    origin: corsOrigin && corsOrigin !== "*" ? corsOrigin.split(",").map((s) => s.trim()) : "*",
  })
);

// Body parsing
app.use(express.json({ limit: "512kb" }));

// Rate limiting — generous for AI endpoints which are slow
const apiLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, slow down." },
});
app.use("/v1", apiLimiter);

const appSecret = process.env.THESIS_APP_SECRET;

app.use("/v1", (req, res, next) => {
  if (!appSecret) {
    // Fail closed: without a secret, reject all requests (except health for readiness check)
    const isHealth = req.method === "GET" && (req.path === "/health" || req.originalUrl === "/v1/health");
    if (isHealth) return next();
    res.status(503).json({ error: "Service misconfigured: THESIS_APP_SECRET not set" });
    return;
  }
  // Health check and feedback are public (feedback also validates payload server-side)
  const isPublic =
    (req.method === "GET" &&
      (req.path === "/health" || req.originalUrl === "/v1/health")) ||
    req.path === "/feedback";
  if (isPublic) return next();
  const key = req.headers["x-thesis-app-key"];
  if (key !== appSecret) {
    res.status(401).json({ error: "Invalid app key" });
    return;
  }
  next();
});

app.get("/v1/market/search", getMarketSearch);
app.get("/v1/market/quote", getMarketQuote);
app.get("/v1/macro/snapshot", getMacroSnapshot);

app.get("/v1/health", (_req, res) => {
  res.json({
    ok: true,
    service: "thesis-api",
  });
});

app.post("/v1/chat", postChat);
app.post("/v1/research/thesis-radar", postThesisResearch);
app.post("/v1/research/debate", postDebate);
app.get("/v1/research/debate/:jobId", getDebateJob);
app.get("/v1/market/sentiment", getMarketSentiment);
app.post("/v1/research/catalysts", postCatalystResearch);
app.post("/v1/memory/extract", postMemoryExtract);
app.post("/v1/webhooks/revenuecat", postRevenueCatWebhook);
app.post("/v1/plaid/link-token", postPlaidLinkToken);
app.post("/v1/plaid/exchange", postPlaidExchange);
app.post("/v1/plaid/sync", postPlaidSync);
app.post("/v1/webhooks/plaid", postPlaidWebhook);
app.post("/v1/mfa/setup", postMfaSetup);
app.post("/v1/mfa/verify", postMfaVerify);
app.post("/v1/mfa/challenge", postMfaChallenge);
app.get("/v1/mfa/status", getMfaStatus);
app.post("/v1/feedback", postFeedback);

if (process.env.DEV_PRO_USER_IDS) {
  seedDevProUsers(process.env.DEV_PRO_USER_IDS.split(",").map((s) => s.trim()));
}

const server = app.listen(port, () => {
  const pace = paceStatus();
  console.log(`Thesis API listening on http://localhost:${port}`);
  if (pace.configured.length) {
    console.log(
      `LLM PACE: ${pace.configured.map((c) => `${c.step}=${c.id}(${c.model})`).join(" → ")}`
    );
  } else {
    console.log("LLM PACE: no keys, add DEEPSEEK_API_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY");
  }
  if (appSecret) {
    console.log(`App auth: THESIS_APP_SECRET is set (use X-Thesis-App-Key header on /v1/chat)`);
  }
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `\nPort ${port} is already in use, another Thesis API is still running.\n` +
        `  Fix: kill -9 $(lsof -ti :${port})   then run npm run server:dev again.\n` +
        `  Or skip this terminal and use the one that already says "listening".\n`
    );
    process.exit(1);
  }
  throw err;
});
