import { createServer } from "vite";
import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.resolve(__dirname, "../../docs/screenshots");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function capture() {
  console.log("[1/5] Starting Vite development server...");
  const server = await createServer({
    root: __dirname,
    server: { port: 5173 },
  });
  await server.listen();
  const url = "http://localhost:5173";
  console.log(`[2/5] Server listening at ${url}`);

  console.log("[3/5] Launching Playwright Chromium...");
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Screenshots (1280x900)
  console.log("[4/5] Capturing Desktop views (1280x900)...");
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
  });

  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto(url, { waitUntil: "networkidle" });

  // Click "Load sample data" button to populate UI
  const sampleBtn = desktopPage.locator(".sample-btn");
  await sampleBtn.click();
  await desktopPage.waitForTimeout(600);

  // Take Desktop Light
  const desktopLightPath = path.join(outputDir, "desktop_light.png");
  await desktopPage.screenshot({ path: desktopLightPath, fullPage: true });
  console.log(`Saved: ${desktopLightPath}`);

  // Switch to Dark theme
  const themeToggle = desktopPage.locator(".theme-toggle");
  await themeToggle.click();
  await desktopPage.waitForTimeout(400);

  // Take Desktop Dark
  const desktopDarkPath = path.join(outputDir, "desktop_dark.png");
  await desktopPage.screenshot({ path: desktopDarkPath, fullPage: true });
  console.log(`Saved: ${desktopDarkPath}`);

  await desktopContext.close();

  // 2. Mobile Screenshots (390x844 - iPhone 14 size)
  console.log("[5/5] Capturing Mobile views (390x844)...");
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });

  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(url, { waitUntil: "networkidle" });

  // Click "Load sample data"
  const mobileSampleBtn = mobilePage.locator(".sample-btn");
  await mobileSampleBtn.click();
  await mobilePage.waitForTimeout(600);

  // Take Mobile Light
  const mobileLightPath = path.join(outputDir, "mobile_light.png");
  await mobilePage.screenshot({ path: mobileLightPath, fullPage: true });
  console.log(`Saved: ${mobileLightPath}`);

  // Toggle theme to dark
  const mobileThemeToggle = mobilePage.locator(".theme-toggle");
  await mobileThemeToggle.click();
  await mobilePage.waitForTimeout(400);

  // Take Mobile Dark
  const mobileDarkPath = path.join(outputDir, "mobile_dark.png");
  await mobilePage.screenshot({ path: mobileDarkPath, fullPage: true });
  console.log(`Saved: ${mobileDarkPath}`);

  await mobileContext.close();
  await browser.close();
  await server.close();

  console.log("\n[SUCCESS] All 4 screenshots captured successfully into docs/screenshots!");
}

capture().catch((err) => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
