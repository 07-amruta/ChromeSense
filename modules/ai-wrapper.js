// modules/ai-wrapper.js

/**
 * summarizeReviews(reviews: string[]) -> Promise<string>
 * Uses Chrome's built-in AI (Prompt API / Summarizer API) when available.
 * Falls back to a simple local summarizer if the APIs are not supported.
 */

async function summarizeReviews(reviews = []) {
  if (!reviews || !reviews.length) return 'No reviews available.';

  const joined = reviews.join('\n\n');

  // --- 1️⃣ Check if Chrome AI APIs are available ---
  if (chrome?.ai && chrome.ai.prompt) {
    try {
      // Create a session if not already created
      const session = await chrome.ai.prompt.create();

      // Define your summarization prompt
      const prompt = `
You are an assistant that summarizes customer reviews into 3 short bullet points.
Make them objective, concise, and helpful for a buyer.

Reviews:
${joined}

Return only bullet points:
`;

      // Run the model
      const response = await session.prompt(prompt);

      // Extract the text
      const summaryText = response?.output?.trim() || response?.text?.trim();
      if (summaryText) return summaryText;

    } catch (err) {
      console.error('Prompt API error:', err);
      // fallback if something fails
    }
  } else if (chrome?.ai && chrome.ai.summarizer) {
    try {
      const model = await chrome.ai.summarizer.create();
      const result = await model.summarize(joined);
      if (result?.summary) return result.summary;
    } catch (err) {
      console.error('Summarizer API error:', err);
    }
  }

  // --- 2️⃣ Local fallback (if APIs unavailable) ---
  const sentences = joined.split('. ').filter(Boolean);
  const bullets = sentences.slice(0, 3).map(s => '- ' + s.trim());
  return bullets.join('\n');
}

export { summarizeReviews };
