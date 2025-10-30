export async function summarizeReviews(reviews = [], productTitle = "") {
  if (!reviews || !reviews.length)
    return "No detailed reviews available for analysis.";

  const joined = reviews.join("\n\n");
  const prompt = `
You are an expert product analyst. 
Summarize the following customer reviews for "${productTitle}".
Return two clear sections:

**Pros:** 3-5 concise bullet points listing key advantages.
**Cons:** 3-5 concise bullet points listing main complaints or drawbacks.

Keep sentences short and objective. Avoid repeating specs verbatim.
Reviews:
${joined}
`;

  try {
    if (chrome?.ai?.prompt) {
      const session = await chrome.ai.prompt.create();
      const res = await session.prompt(prompt);
      return res?.output?.trim() || res?.text?.trim() || "[No summary]";
    }

    // fallback simple local summary
    const sentences = joined.split(/[.!?]/).filter(s => s.trim());
    const pros = sentences.slice(0, 3).map(s => "- " + s.trim());
    const cons = sentences.slice(-3).map(s => "- " + s.trim());
    return `**Pros:**\n${pros.join("\n")}\n\n**Cons:**\n${cons.join("\n")}`;
  } catch (e) {
    console.error("AI summarize failed:", e);
    return "[summary failed]";
  }
}
