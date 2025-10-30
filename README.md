# ChromeSense

ChromeSense is a privacy-first Chrome extension (MVP) that aggregates product information from open product tabs (Amazon.in and Flipkart), summarizes user reviews, and displays a side-by-side comparison — all within your browser. The included code uses a safe local summarizer fallback so it runs out-of-the-box; placeholders are included to wire in Chrome’s built-in AI (Prompt / Summarizer) later.

## Features (MVP)
- Detects product pages on Amazon.in and Flipkart and extracts title, price, image, rating, and top reviews.
- Aggregates product entries from all open tabs and shows a side-by-side comparison in the popup.
- Produces quick review summaries (fallback heuristics). Placeholder code is included to call Chrome’s built-in Summarizer/Prompt APIs (Gemini Nano).
- All processing is local — no data is sent to external servers.

## Quick install (developer)
1. Clone or download this repository.
2. Open Chrome → `chrome://extensions` → enable **Developer mode**.
3. Click **Load unpacked** and select the repository folder (the folder containing `manifest.json`).
4. Open product pages (Amazon.in or Flipkart) — wait ~1s for the extractor to run.
5. Click the ChromeSense extension icon → click **Refresh** → view comparisons and summaries.

## Where to hook your Chrome built-in AI
Edit `modules/ai-wrapper.js` and replace the `summarizeReviews` fallback with calls to Chrome’s Summarizer or Prompt API following the official docs. There are comments showing the exact place to integrate.

## Notes & testing
- If you open multiple product tabs, the popup will collect data stored in local extension storage.
- The extension purposely includes a local fallback so judges/testers can run it without requiring special Chrome flags for AI.
- Make sure to test with product pages on `amazon.in` and `flipkart.com`. Selectors may require tuning if the site has changed layout.

## License
MIT. See LICENSE file.
