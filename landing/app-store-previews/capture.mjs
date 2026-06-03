/**
 * Captures App Store screenshots at 1290×2796 (6.7" iPhone).
 * Usage: node landing/app-store-previews/capture.mjs
 */
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { dirname, extname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LANDING_DIR = resolve(__dirname, "..");
const PORT = 3456;

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
};

function startServer() {
  return createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    let filePath = join(LANDING_DIR, url.pathname === "/" ? "index.html" : url.pathname);

    if (!extname(filePath) && existsSync(filePath + ".html")) {
      filePath += ".html";
    }

    if (!existsSync(filePath)) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(readFileSync(filePath));
  }).listen(PORT);
}

async function main() {
  console.log(`Starting server on http://localhost:${PORT}...`);
  const server = startServer();

  const chromePaths = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
  ];
  const executablePath = chromePaths.find((p) => existsSync(p));
  const browser = await puppeteer.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 1 });

  const previewUrl = `http://localhost:${PORT}/app-store-previews/previews.html`;
  console.log(`Loading ${previewUrl}...`);
  await page.goto(previewUrl, { waitUntil: "networkidle0" });

  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 3500));

  const previews = await page.$$(".preview");
  console.log(`Found ${previews.length} previews`);

  for (let i = 0; i < previews.length; i++) {
    const exportName =
      (await previews[i].evaluate((el) => el.getAttribute("data-export"))) ||
      `preview-${String(i + 1).padStart(2, "0")}`;
    const path = resolve(__dirname, `${exportName}.png`);

    const clip = await previews[i].boundingBox();
    if (!clip) {
      console.warn(`  Skip ${exportName}: no bounding box`);
      continue;
    }

    console.log(
      `Capturing "${exportName}" at ${Math.round(clip.width)}×${Math.round(clip.height)}...`,
    );

    await previews[i].screenshot({ path, type: "png", omitBackground: false });

    const kb = (readFileSync(path).length / 1024).toFixed(0);
    console.log(`  → ${exportName}.png (${kb} KB)`);
  }

  await browser.close();
  server.close();
  console.log("\nDone! Upload PNGs from landing/app-store-previews/ to App Store Connect (6.7\" display).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
