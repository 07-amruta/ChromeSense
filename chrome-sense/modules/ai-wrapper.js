// modules/ai-wrapper.js

/**
 * Check if Chrome AI Prompt API is available
 */
export async function checkAIAvailability() {
  try {
    // Check for Prompt API (new Chrome AI API)
    if (!self.ai || !self.ai.languageModel) {
      console.warn("❌ Prompt API not available");
      return false;
    }
    
    const capabilities = await self.ai.languageModel.capabilities();
    console.log("🔍 Prompt API capabilities:", capabilities);
    
    if (capabilities.available === "no") {
      console.warn("❌ Prompt API model not available");
      return false;
    }
    
    if (capabilities.available === "after-download") {
      console.warn("⏳ Prompt API model needs to be downloaded");
      return false;
    }
    
    console.log("✅ Prompt API is ready!");
    return true;
  } catch (error) {
    console.error("❌ AI availability check failed:", error);
    return false;
  }
}

/**
 * Create AI session using Prompt API
 */
async function createPromptSession() {
  try {
    if (!self.ai || !self.ai.languageModel) {
      throw new Error("Prompt API not available");
    }
    
    // Create session with Prompt API
    const session = await self.ai.languageModel.create({
      temperature: 0.7,
      topK: 3,
    });
    
    console.log("✅ Prompt API session created");
    return session;
  } catch (error) {
    console.error("❌ Failed to create Prompt API session:", error);
    return null;
  }
}

/**
 * Summarize product reviews using Chrome's Prompt API
 */
export async function summarizeReviews(reviews = [], productTitle = "") {
  if (!reviews || reviews.length === 0) {
    return JSON.stringify({ pros: [], cons: ["No detailed reviews available for analysis."] });
  }

  const joined = reviews.slice(0, 10).join("\n\n");
  
  const prompt = `Analyze the following customer reviews for the product "${productTitle}".
Extract the main pros and cons.
Return a JSON object with two keys: "pros" and "cons".
Each key should have an array of strings, with each string being a concise point.
Limit each point to under 15 words.

Example output:
{
  "pros": ["Easy to use", "Good battery life"],
  "cons": ["A bit expensive", "Screen could be brighter"]
}

Customer Reviews:
${joined}
`;

  try {
    // Check if Prompt API is available
    const isAvailable = await checkAIAvailability();
    
    if (isAvailable) {
      const session = await createPromptSession();
      
      if (session) {
        console.log("✅ Using Chrome Prompt API for summarization");
        const response = await session.prompt(prompt);
        await session.destroy();
        return response || JSON.stringify({ pros: [], cons: [], note: "Unable to generate summary." });
      }
    }
    
    // Fallback if API not available
    console.log("⚠️ Prompt API not available, using fallback");
    return generateFallbackSummary(reviews);
    
  } catch (error) {
    console.error("❌ Summarization failed:", error);
    return generateFallbackSummary(reviews);
  }
}

/**
 * Generate AI comparison between products using Prompt API
 */
export async function generateComparison(products) {
  if (!products || products.length < 2) {
    return "Add at least 2 products to compare.";
  }

  const context = products.map((p, i) => {
    const reviews = (p.reviews || []).slice(0, 2).join(". ");
    const productNum = i + 1;
    return `
Product ${productNum}: ${p.title}
- Price: ${p.price || "Not available"}
- Rating: ${p.rating || "Not rated"}
- Source: ${p.site === "amazon" ? "Amazon" : "Flipkart"}
- Key feedback: ${reviews || "No reviews"}
`;
  }).join("\n");

  const prompt = `You are a smart shopping assistant helping customers compare products.

Compare these ${products.length} products objectively:

${context}

Provide your analysis in this format:
1. Brief 2-3 sentence comparison highlighting key differences in features, price, and ratings
2. Clear recommendation stating which product offers the best value and why

Keep it concise and consumer-friendly.`;

  try {
    const isAvailable = await checkAIAvailability();
    
    if (isAvailable) {
      const session = await createPromptSession();
      
      if (session) {
        console.log("✅ Using Chrome Prompt API for comparison");
        const response = await session.prompt(prompt);
        await session.destroy();
        
        // Format the response as HTML
        return formatComparisonResponse(response, products);
      }
    }
    
    // Fallback comparison
    console.log("⚠️ Prompt API not available, using fallback");
    return generateFallbackComparison(products);
    
  } catch (error) {
    console.error("❌ Comparison failed:", error);
    return generateFallbackComparison(products);
  }
}

/**
 * Format AI comparison response into beautiful HTML
 */
function formatComparisonResponse(response, products) {
  // If response is already HTML, return it
  if (response.includes("<div")) {
    return response;
  }
  
  // Create product cards
  let html = '<div class="comparison-grid">';
  
  products.forEach((p, i) => {
    const shortTitle = p.title.length > 50 ? p.title.substring(0, 50) + "..." : p.title;
    const siteIcon = p.site === "amazon" ? "🟠" : "🔵";
    const siteName = p.site === "amazon" ? "Amazon" : "Flipkart";
    const productNum = i + 1;
    
    html += `
      <div class="comparison-product">
        <div class="comparison-product-header">
          <span class="product-number">#${productNum}</span>
          <span class="product-site">${siteIcon} ${siteName}</span>
        </div>
        <h4 class="comparison-title">${shortTitle}</h4>
        <div class="comparison-details">
          <div class="detail-item">
            <span class="detail-label">💰 Price</span>
            <span class="detail-value price-value">${p.price || "N/A"}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">⭐ Rating</span>
            <span class="detail-value">${p.rating || "N/A"}</span>
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  
  // Add AI recommendation box
  html += `
    <div class="recommendation-box">
      <div class="recommendation-icon">🤖</div>
      <div class="recommendation-content">
        <h4>AI-Powered Recommendation</h4>
        <p style="white-space: pre-wrap; line-height: 1.7;">${response}</p>
      </div>
    </div>
  `;
  
  return html;
}

/**
 * Fallback: Simple local summary without AI
 */
function generateFallbackSummary(reviews) {
  const joined = reviews.join(" ");
  const words = joined.toLowerCase();
  
  const pros = [];
  const cons = [];
  
  // Simple keyword detection
  if (words.includes("good") || words.includes("great") || words.includes("excellent")) {
    pros.push("- Generally positive customer feedback");
  }
  if (words.includes("quality") && words.includes("good")) {
    pros.push("- Good build quality mentioned");
  }
  if (words.includes("value") || words.includes("worth")) {
    pros.push("- Considered good value for money");
  }
  if (words.includes("sound") && words.includes("good")) {
    pros.push("- Sound quality praised");
  }
  if (words.includes("battery") && words.includes("good")) {
    pros.push("- Good battery life reported");
  }
  
  if (words.includes("bad") || words.includes("poor") || words.includes("disappointing")) {
    cons.push("- Some negative feedback reported");
  }
  if (words.includes("issue") || words.includes("problem")) {
    cons.push("- Quality issues mentioned by some users");
  }
  if (words.includes("not") && words.includes("good")) {
    cons.push("- Some aspects not meeting expectations");
  }
  if (words.includes("bluetooth") && (words.includes("issue") || words.includes("problem"))) {
    cons.push("- Bluetooth connectivity issues reported");
  }
  
  if (pros.length === 0) pros.push("- Positive aspects noted in reviews");
  if (cons.length === 0) cons.push("- Some areas for improvement mentioned");
  
  return JSON.stringify({
    pros,
    cons,
    note: "Using fallback analysis. Enable Chrome AI for better insights."
  });
}

/**
 * Fallback: Basic comparison without AI
 */
function generateFallbackComparison(products) {
  const prices = products
    .map(p => p.price)
    .filter(p => p && p.includes("₹"))
    .map(p => parseInt(p.replace(/[₹,]/g, "")));
  
  let html = '<div class="comparison-grid">';
  
  products.forEach((p, i) => {
    const shortTitle = p.title.length > 50 ? p.title.substring(0, 50) + "..." : p.title;
    const siteIcon = p.site === "amazon" ? "🟠" : "🔵";
    const siteName = p.site === "amazon" ? "Amazon" : "Flipkart";
    const productNum = i + 1;
    
    html += `
      <div class="comparison-product">
        <div class="comparison-product-header">
          <span class="product-number">#${productNum}</span>
          <span class="product-site">${siteIcon} ${siteName}</span>
        </div>
        <h4 class="comparison-title">${shortTitle}</h4>
        <div class="comparison-details">
          <div class="detail-item">
            <span class="detail-label">💰 Price</span>
            <span class="detail-value price-value">${p.price || "N/A"}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">⭐ Rating</span>
            <span class="detail-value">${p.rating || "N/A"}</span>
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  
  if (prices.length >= 2) {
    const cheapest = Math.min(...prices);
    const mostExpensive = Math.max(...prices);
    const cheapestIndex = products.findIndex(p => p.price && p.price.includes(cheapest.toString()));
    const cheapestProductNum = cheapestIndex + 1;
    const savings = mostExpensive - cheapest;
    
    html += `
      <div class="recommendation-box">
        <div class="recommendation-icon">💡</div>
        <div class="recommendation-content">
          <h4>Best Value Recommendation</h4>
          <p><strong>Product #${cheapestProductNum}</strong> offers the best price at <strong>₹${cheapest.toLocaleString("en-IN")}</strong></p>
          <p class="savings-text">💰 Save <strong>₹${savings.toLocaleString("en-IN")}</strong> compared to the highest priced option!</p>
          <p style="font-size: 12px; color: var(--text-muted); margin-top: 8px;">
            <em>Using fallback analysis. Enable Chrome AI for AI-powered insights.</em>
          </p>
        </div>
      </div>
    `;
  } else {
    html += `
      <div class="recommendation-box">
        <div class="recommendation-icon">💡</div>
        <div class="recommendation-content">
          <h4>Comparison Insight</h4>
          <p>Compare the ratings, prices, and features above to find the best value for your needs.</p>
          <p style="font-size: 12px; color: var(--text-muted); margin-top: 8px;">
            <em>Using fallback analysis. Enable Chrome AI for AI-powered insights.</em>
          </p>
        </div>
      </div>
    `;
  }
  
  return html;
}
