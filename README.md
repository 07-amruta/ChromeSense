# ChromeSense — AI Product Comparison Extension

> Smart, privacy-first product comparison for Amazon & Flipkart using Chrome's local AI (Gemini Nano) with a robust fallback.

**Built for Google Chrome AI Challenge 2025** | Uses Gemini Nano when available

---

## Quick overview

ChromeSense scans open product tabs (Amazon / Flipkart), extracts product details, and shows concise comparisons and recommendations. It runs fully locally: either on-device with Gemini Nano (when available) or with a keyword-based fallback that preserves privacy.

Solves the product comparison problem by consolidating specs, prices, and reviews from open tabs into a clear, side‑by‑side view, powered locally by Gemini Nano or a private fallback.

---

## How to run (two options)

Choose one of the following depending on whether you want the on-device Gemini Nano experience or a simpler, compatible setup.

### Option 1 — Chrome Dev (recommended for Gemini Nano)

Best for the full AI experience (Gemini Nano)

1. Install Chrome Dev
   - Download from: https://www.google.com/chrome/dev/

2. Enable the experimental AI features
   - Open `chrome://flags`
   - Enable these flags:
     - `prompt-api-for-gemini-nano` → Enabled
     - `optimization-guide-on-device-model` → Enabled BypassPerfRequirement
     - `summarization-api-for-gemini-nano` → Enabled
   - Relaunch the browser

3. (Optional) Trigger model download
   - Open `chrome://components`
   - Find **"Optimization Guide On Device Model"** and click **Check for update**
   - Download can take several minutes and ~1–1.5 GB disk space

4. Load the extension
   - Open `chrome://extensions`
   - Turn on **Developer mode**
   - Click **Load unpacked** and select the extension folder (the `chrome-sense/` directory)

5. Run ChromeSense
   - Open product pages (Amazon / Flipkart) in separate tabs
   - Click the ChromeSense icon in the toolbar
   - Click **Scan Tabs** to scan all open product tabs
   - View AI summaries and comparisons inside the popup

Notes and troubleshooting for this mode:
   - Gemini Nano is a platform feature and availability varies by Chrome build and OS.
   - If Gemini Nano is not yet available on your device or fails to load, the extension falls back to the local keyword-based analyzer (see AI vs Fallback below).

### Option 2 — Regular Chrome (fallback mode)

Use this if you want a simple setup or cannot run Chrome Dev.

1. Load the extension
   - Open `chrome://extensions`
   - Turn on **Developer mode**
   - Click **Load unpacked** and select the extension folder (the `chrome-sense/` directory)

2. Run ChromeSense
   - Open product pages (Amazon / Flipkart) in separate tabs
   - Click the ChromeSense icon in the toolbar
   - Click **Scan Tabs** to analyze opened tabs
   - View results inside the popup (keyword-based analysis)

Notes:
   - This mode does not require Gemini Nano or any special flags.
   - The extension remains fully local and privacy-preserving.

---

## How to add ChromeSense to Chrome (summary)

1. Open `chrome://extensions` in your browser
2. Enable **Developer mode** (toggle at top-right)
3. Click **Load unpacked** and point to the `chrome-sense/` folder in this repo
4. The extension icon will appear in the toolbar — pin it for easy access

To run: open the product tabs you want compared, click the extension icon, then click **Scan Tabs**.

Tip: When scanning many tabs, click each product tab once (see Areas for improvement) to ensure the extension captures all product details reliably.

---

## AI vs Fallback mode — what to expect

- Gemini Nano (on-device AI)
  - When available and loaded, provides rich, context-aware summaries and better comparisons.
  - Runs fully on device (no external network requests).

- Fallback (keyword-based analyzer)
  - Used when Gemini Nano is unavailable or fails to load.
  - Produces reliable but more limited output (price, ratings, key specs extracted via heuristics).

Current status:
  - At the moment, some users and builds have reported Gemini Nano failing to load. When that happens ChromeSense automatically uses the fallback analyzer.
  - The fallback works and preserves privacy, but it does not provide as much contextual or generative insight as Gemini Nano. Improving Gemini Nano loading reliability and parity in output is an active area of development for this project.

---

## Areas of improvement

1. Gemini Nano reliability
   - Improve detection / model download and handling so the on-device model loads consistently across systems.

2. Tab scanning reliability
   - Currently, users may need to click once on all product tabs to ensure every product page is fully scanned. Improve background tab scraping so a full scan works without manual tab activation.

3. (Future) UI polish and richer comparisons
   - Add richer comparison visuals and more configurable comparison criteria.

---

## � Technical Stack

- **Chrome Prompt API** — Gemini Nano integration when available
- **Manifest V3** — Chrome extension architecture
- **JavaScript (ES6+)** — Async/await and modern JS patterns
- **Zero external APIs** — All processing runs locally

---

## 🎯 Hackathon Compliance Checklist

- ✅ Implements Chrome Prompt API
- ✅ Works with or without built-in AI
- ✅ No external dependencies required
- ✅ 100% privacy-focused (local processing only)
- ✅ Graceful fallback system

---

## 📄 License

MIT License — free to use and modify

---
