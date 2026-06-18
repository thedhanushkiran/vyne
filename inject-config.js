/**
 * inject-config.js
 * ─────────────────
 * Run by Netlify at build time (see netlify.toml).
 * Reads VYNE_SIGNAL_URL from Netlify environment variables and
 * injects it into index.html as a runtime constant.
 *
 * This means:
 *  - No secrets in source code
 *  - The URL is set via Netlify dashboard (safe)
 *  - Local dev still works (falls back to ws://localhost:8080)
 */

const fs = require("fs");

const signalUrl = process.env.VYNE_SIGNAL_URL;
if (!signalUrl) {
  console.warn("⚠️  VYNE_SIGNAL_URL not set — using localhost fallback. Set it in Netlify dashboard.");
}

const html = fs.readFileSync("index.html", "utf8");

const injected = html.replace(
  "window.__VYNE_SIGNAL_URL__ || \"ws://localhost:8080\"",
  `"${signalUrl || "ws://localhost:8080"}"`
);

fs.writeFileSync("index.html", injected);
console.log(`✅ Signal URL injected: ${signalUrl || "ws://localhost:8080 (fallback)"}`);
