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
    return "No detailed reviews available for analysis.";
  }

  const joined = reviews.slice(0, 10).join("\n\n");
  
  const prompt = `You are an expert product analyst helping customers make informed decisions.

Product: ${productTitle}

Analyze these customer reviews and provide a balanced summary in this EXACT format:

**Pros:**
- [Key advantage 1]
- [Key advantage 2]
- [Key advantage 3]

**Cons:**
- [Main complaint 1]
- [Main complaint 2]
- [Main complaint 3]

Keep each point under 15 words. Focus on the most frequently mentioned aspects.

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
        return response || "Unable to generate summary.";
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

  const prompt = `You are a friendly and helpful shopping assistant.
Your goal is to provide a clear, concise, and visually appealing comparison of the following products.

Products:
${context}

Your analysis should be in two parts:

**1. Quick Comparison:**
A short, easy-to-read summary of the key differences. Use bullet points with emojis for each key point (e.g., "💰 Price:", "⭐ Rating:", "🚀 Performance:").

**2. Recommendation:**
A clear and confident recommendation of the best product for the user and a brief explanation of why. Start with "🏆 Best Choice:".

Make it fun and engaging!`;

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
    const siteIcon = p.site === "amazon" ? "🛒" : "🛍️";
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
  
  return `**Pros:**\n${pros.join("\n")}\n\n**Cons:**\n${cons.join("\n")}\n\n*Note: Using fallback analysis. Enable Chrome AI for better insights.*`;
}

/**
 * Fallback: Basic comparison without AI
 */
function generateFallbackComparison(products) {
  let html = '<div class="comparison-grid">';
  let cheapestProduct = null;
  let cheapestPrice = Infinity;
  let mostExpensivePrice = -Infinity;

  for (const p of products) {
    if (p.price && p.price.includes("₹")) {
      const price = parseInt(p.price.replace(/[₹,]/g, ""));
      if (price < cheapestPrice) {
        cheapestPrice = price;
        cheapestProduct = p;
      }
      if (price > mostExpensivePrice) {
        mostExpensivePrice = price;
      }
    }
  }

  products.forEach((p, i) => {
    const shortTitle = p.title.length > 50 ? p.title.substring(0, 50) + "..." : p.title;
    const siteIcon = p.site === "amazon" ? "🛒" : "🛍️";
    const siteName = p.site === "amazon" ? "Amazon" : "Flipkart";
    const productNum = i + 1;
    const isRecommended = p === cheapestProduct;

    html += `
      <div class="comparison-product ${isRecommended ? 'recommended' : ''}">
        ${isRecommended ? '<div class="recommended-badge">Best Value</div>' : ''}
        <div class="comparison-product-header">
          <span class="product-number">#${productNum}</span>
          <span class="product-site">${siteIcon} ${siteName}</span>
        </div>
        <h4 class="comparison-title">${shortTitle}</h4>
        <div class="comparison-details">
          <div class="detail-item">
            <span class="detail-label">Price</span>
            <span class="detail-value price-value">${p.price || "N/A"}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Rating</span>
            <span class="detail-value">${p.rating || "N/A"}</span>
          </div>
        </div>
      </div>
    `;
  });

  html += '</div>';

  if (cheapestProduct) {
    const savings = mostExpensivePrice - cheapestPrice;
    html += `
      <div class="recommendation-box">
        <div class="recommendation-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-star">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </div>
        <div class="recommendation-content">
          <h4>Top Pick for Value!</h4>
          <p>Our analysis shows that <strong>Product #${products.indexOf(cheapestProduct) + 1}</strong> offers the best value at just <strong>₹${cheapestPrice.toLocaleString("en-IN")}</strong>.</p>
          ${savings > 0 ? `<p class="savings-text">You could save <strong>₹${savings.toLocaleString("en-IN")}</strong> by choosing this option!</p>` : ''}
          <p class="ai-note">
            <em>Tip: Enable Chrome AI for personalized insights and smarter recommendations.</em>
          </p>
        </div>
      </div>
    `;
  } else {
    html += `
      <div class="recommendation-box">
        <div class="recommendation-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-lightbulb">
            <path d="M12 18a6 6 0 0 0 0-12c-3.31 0-6 2.69-6 6s2.69 6 6 6z"></path>
            <path d="M12 22v-4"></path>
            <path d="M12 2L12 6"></path>
            <path d="M22 12h-4"></path>
            <path d="M2 12h4"></path>
            <path d="M19.78 4.22l-2.83 2.83"></path>
            <path d="M4.22 19.78l2.83-2.83"></path>
            <path d="M4.22 4.22l2.83 2.83"></path>
            <path d="M19.78 19.78l-2.83-2.83"></path>
          </svg>
        </div>
        <div class="recommendation-content">
          <h4>Compare and Decide</h4>
          <p>We couldn't pinpoint a single best value. Review the details above to find the perfect product for you.</p>
          <p class="ai-note">
            <em>Tip: Enable Chrome AI for a detailed, AI-powered comparison.</em>
          </p>
        </div>
      </div>
    `;
  }

  return html;
}
