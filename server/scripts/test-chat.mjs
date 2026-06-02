#!/usr/bin/env node
/** Quick local chat test against running API. */
import "dotenv/config";

const port = process.env.PORT ?? 8787;
const secret = process.env.THESIS_APP_SECRET ?? "dev-shared-secret-change-me";
const base = `http://localhost:${port}`;

const res = await fetch(`${base}/v1/chat`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Thesis-App-Key": secret,
  },
  body: JSON.stringify({
    userId: "dev-test-user",
    userMessage: "Reply in one sentence: what is Thesis CFO?",
    system: "You are Thesis CFO. Be brief.",
    history: [],
  }),
});

const data = await res.json();
if (!res.ok) {
  console.error("Chat failed:", data);
  process.exit(1);
}

console.log("Chat OK");
console.log("provider:", data.provider ?? data.model);
console.log("content:", data.content?.slice(0, 200));
