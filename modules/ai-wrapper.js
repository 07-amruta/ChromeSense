// modules/ai-wrapper.js

/**
 * summarizeReviews(reviews: string[]) -> Promise<string>
 * - Currently uses a simple heuristic fallback summarizer so the extension runs without Chrome AI.
 * - Replace the fallback block with a call to Chrome's Summarizer / Prompt API when ready.
 */
async function summarizeReviews(reviews = []) {
  if (!reviews || !reviews.length) return 'No reviews available.';

  // Fallback simple summarizer: pick most common adjectives / start sentences
  const text = reviews.join('. ').replace(/\s+/g, ' ').trim();
  // take first 2-3 sentences as quick summary
  const sentences = text.split('. ').filter(Boolean);
  let result = sentences.slice(0, 3).join('. ');
  if (!result.endsWith('.')) result += '.';
  // create 3 bullets if possible
  const bullets = sentences.slice(0, 3).map(s => '- ' + s.trim());
  return bullets.join('\n');
}

/* ====== PLACEHOLDER: How to integrate Chrome Built-in AI (example pseudocode) ======
   When you are ready to use Chrome's built-in Summarizer/Prompt APIs (Gemini Nano),
   replace the fallback above with an API call. Example pseudocode:

   async function summarizeReviews(reviews=[]) {
     const joined = reviews.join('\\n\\n');
     const response = await chrome.ai.summarize({ text: joined, options: { format: 'bullets', max_sentences: 3 }});
     // or using Prompt API: chrome.ai.predict / chrome.ai.generate (see Chrome docs)
     return response.summaryText || response.output || fallback;
   }

   Note: check the official Chrome extension docs for the exact chrome.ai.* method names and required permission/flags.
================================================================================= */

export { summarizeReviews };
