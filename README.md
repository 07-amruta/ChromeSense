
# ChromeSense — AI Product Comparison Extension

**Smart, privacy-first product comparison for Amazon and Flipkart using on-device AI with a robust local fallback.**

**Built for the Google Chrome AI Challenge 2025**

---

## Overview

**ChromeSense** scans open product tabs (Amazon / Flipkart), extracts product details, and generates clear side-by-side comparisons and recommendations.

All processing runs locally — either using Chrome’s built-in **Gemini Nano** (when available) or a **keyword-based fallback** that ensures complete privacy.

ChromeSense simplifies online shopping by consolidating specifications, prices, and reviews into one concise, private, and efficient interface.

---

## Installation and Usage

ChromeSense runs in any version of Chrome. Gemini Nano (on-device AI) is automatically used when available; otherwise, the extension switches to its local fallback analyzer.

### Installation Steps

1. Open `chrome://extensions` in Chrome.  
2. Enable **Developer mode** (toggle in the top-right corner).  
3. Click **Load unpacked** and select the `chrome-sense/` folder.  
4. The ChromeSense icon will appear in your toolbar — pin it for quick access.

### Running ChromeSense

1. Open product pages (Amazon / Flipkart) in separate tabs.  
2. Click the **ChromeSense** toolbar icon.  
3. Click **Scan Tabs** to analyze all open product tabs.  
4. View product summaries and comparisons directly in the popup window.

---

## AI and Fallback Modes

ChromeSense automatically selects the best available mode based on your Chrome setup.

### Gemini Nano (On-Device AI)
- Provides detailed, context-aware summaries and comparisons.  
- Runs fully on-device — no external requests or data sharing.  
- Availability depends on your Chrome build and operating system.

### Keyword-Based Fallback Analyzer
- Automatically used if Gemini Nano is unavailable.  
- Extracts product specifications, ratings, and prices using efficient local heuristics.  
- Maintains complete privacy — no data leaves your device.

Both modes operate entirely locally, ensuring privacy and reliability.

---

## Notes and Troubleshooting

- Ensure each product tab is **fully loaded** before scanning. Clicking each tab once improves accuracy.  
- If Gemini Nano is unsupported on your system, ChromeSense will automatically use the fallback mode.  
- When Chrome adds full Gemini Nano support for your system, ChromeSense will use it without requiring reinstallation.

---

## Areas for Improvement

1. **Gemini Nano reliability** – Improve detection and model handling for consistent AI performance.  
2. **Background tab scanning** – Enable reliable analysis without requiring manual tab activation.  
3. **UI and comparisons** – Add richer visual comparisons and customizable comparison criteria.

---

## Technical Stack

- **Chrome Prompt API** (Gemini Nano integration)  
- **Manifest V3** (Chrome Extension architecture)  
- **JavaScript (ES6+)**  
- **Zero external APIs** — all processing is local

---

## Hackathon Compliance

- Implements Chrome Prompt API  
- Works with or without built-in AI  
- No external dependencies  
- Fully privacy-preserving (local only)  
- Includes a robust fallback system  

---

## License

MIT License — free to use and modify.

---