# ChromeSense — AI Product Comparison Extension

**Smart, privacy-first product comparison for Amazon and Flipkart using on-device AI with a robust local fallback.**  
**Built for the Google Chrome AI Challenge 2025**

---

## Overview

Online shoppers often open multiple Amazon or Flipkart tabs to compare products manually.  
**ChromeSense** automates that process — it scans open product pages, extracts specifications, prices, and reviews, and generates clear side-by-side comparisons directly in your browser.

All analysis happens locally: using Chrome’s on-device **Gemini Nano** (when available) or a lightweight, privacy-preserving fallback when it’s not.

---

### Key Features

- Local AI-powered product comparisons using Chrome’s on-device Gemini Nano  
- Private, offline fallback mode when AI is unavailable  
- Works seamlessly with Amazon and Flipkart  
- One-click tab scanning and instant summaries  
- 100% local processing — no external APIs or data collection  

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

| Mode | Description | Processing | Requirements |
|------|--------------|-------------|---------------|
| **Gemini Nano (AI)** | Context-aware summaries and detailed comparisons | On-device (Gemini Nano) | Chrome with AI support |
| **Fallback Analyzer** | Extracts specs, prices, and ratings using local heuristics | Local JavaScript | Works in all Chrome versions |

Both modes operate entirely on-device to ensure privacy and reliability.

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