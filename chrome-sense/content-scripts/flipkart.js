// content-scripts/flipkart.js
(function () {
  console.log("🟦 Flipkart extractor starting...");

  function wait(ms) {
    return new Promise(function(resolve) {
      setTimeout(resolve, ms);
    });
  }

  async function scrollPage() {
    try {
      console.log("📜 Starting page scroll...");
      for (let i = 0; i < 5; i++) {
        window.scrollBy(0, 300);
        await wait(300);
      }
      window.scrollTo(0, 0);
      await wait(500);
      console.log("✅ Page scroll completed");
    } catch (error) {
      console.error("❌ Scroll error:", error);
    }
  }

  function getTitle() {
    const selectors = ["span.B_NuCI", "span.VU-ZEz", "h1.yhB1nd", "h1", "span[class*='B_NuCI']"];
    for (let i = 0; i < selectors.length; i++) {
      const el = document.querySelector(selectors[i]);
      if (el && el.innerText) {
        console.log("✅ Title found");
        return el.innerText.trim();
      }
    }
    console.log("⚠️ Using document.title as fallback");
    return document.title.split("|")[0].trim();
  }

  function getPrice() {
    let price = null;
    
    const priceSelectors = [
      "div._30jeq3._16Jk6d",
      "div._30jeq3",
      "div._16Jk6d",
      "div._1vC4OE._3qQ9m1",
      "div._25b18c div",
      "div[class*='_30jeq3']"
    ];

    for (let i = 0; i < priceSelectors.length; i++) {
      const el = document.querySelector(priceSelectors[i]);
      if (el && el.innerText && el.innerText.trim().startsWith("₹")) {
        price = el.innerText.trim();
        console.log("✅ Price found");
        break;
      }
    }

    if (!price) {
      console.log("⚠️ Trying fallback price detection...");
      const allDivs = document.querySelectorAll("div");
      for (let div of allDivs) {
        const text = div.innerText;
        if (text && text.match(/^₹[\d,]+$/) && text.length < 50) {
          price = text.trim();
          console.log("✅ Price found via fallback");
          break;
        }
      }
    }

    console.log("💰 Price extracted:", price);
    return price;
  }

  function getImage() {
    console.log("🔍 [Attempt 1] Checking img[src] attributes directly...");
    
    // Get ALL images and log them for debugging
    const allImages = Array.from(document.querySelectorAll("img"));
    console.log(`📊 Total images on page: ${allImages.length}`);
    
    // Log first 10 images for debugging
    allImages.slice(0, 10).forEach((img, idx) => {
      console.log(`Image ${idx}: src=${img.src?.substring(0, 100) || 'NO SRC'}, class=${img.className}, alt=${img.alt}`);
    });
    
    // Try to find image from img tag with src
    for (let img of allImages) {
      if (!img.src) continue;
      
      // Skip very small images
      const width = img.width || img.naturalWidth || 0;
      const height = img.height || img.naturalHeight || 0;
      if (width < 100 && height < 100) continue;
      
      // Skip placeholder and data URLs
      if (img.src.startsWith("data:") || 
          img.src.includes("placeholder") || 
          img.src.includes("empty")) continue;
      
      // Prefer Flipkart CDN images
      if (img.src.includes("rukminim") || 
          img.src.includes("flipkart") ||
          img.src.includes("cdn")) {
        console.log(`✅ Image found: ${img.src.substring(0, 100)}`);
        return cleanImageUrl(img.src);
      }
    }

    console.log("🔍 [Attempt 2] Searching in common containers...");
    
    // Try specific containers
    const containerIds = ["productImage", "landingImage", "main_container"];
    for (let id of containerIds) {
      const container = document.getElementById(id);
      if (container) {
        const img = container.querySelector("img");
        if (img?.src) {
          console.log(`✅ Image found in container #${id}`);
          return cleanImageUrl(img.src);
        }
      }
    }

    console.log("🔍 [Attempt 3] Checking for image in shadow DOM...");
    
    // Try shadow DOM if available
    for (let el of document.querySelectorAll("*")) {
      if (el.shadowRoot) {
        const img = el.shadowRoot.querySelector("img[src*='rukminim'], img[src*='cdn']");
        if (img?.src) {
          console.log("✅ Image found in shadow DOM");
          return cleanImageUrl(img.src);
        }
      }
    }

    console.log("🔍 [Attempt 4] Extracting from window object...");
    
    // Try to extract image URL from window.__INITIAL_STATE__ or similar
    if (window.__INITIAL_STATE__) {
      try {
        const state = JSON.stringify(window.__INITIAL_STATE__);
        const matches = state.match(/"url":"([^"]*rukminim[^"]*)"/g);
        if (matches && matches.length > 0) {
          const url = matches[0].match(/"url":"([^"]*)"/)[1];
          if (url) {
            console.log("✅ Image found in window state");
            return cleanImageUrl(url);
          }
        }
      } catch (e) {
        console.log("⚠️ Could not parse window state:", e.message);
      }
    }

    console.log("🔍 [Attempt 5] Checking all img tags regardless of visibility...");
    
    // Last resort: any img with a URL longer than 50 chars
    for (let img of allImages) {
      if (img.src && img.src.length > 50 && !img.src.startsWith("data:")) {
        console.log(`✅ Image found (fallback): ${img.src.substring(0, 100)}`);
        return cleanImageUrl(img.src);
      }
    }

    console.log("⚠️ No image found after all attempts");
    return null;
  }

  function cleanImageUrl(url) {
    if (!url) return null;
    
    // Ensure HTTPS
    if (url.startsWith("http://")) {
      url = url.replace("http://", "https://");
    }
    
    // Remove query parameters (keep the base URL)
    if (url.includes("?")) {
      url = url.split("?")[0];
    }
    
    // Add quality parameter for better image
    if (!url.includes("?")) {
      url += "?q=70";
    }
    
    console.log("🖼️ Cleaned image URL:", url.substring(0, 100));
    return url;
  }

  function getRating() {
    const selectors = ["div._3LWZlK", "div._2d4LTz", "div[class*='_3LWZlK']"];
    for (let i = 0; i < selectors.length; i++) {
      const el = document.querySelector(selectors[i]);
      if (el && el.innerText) {
        console.log("✅ Rating found");
        return el.innerText.trim();
      }
    }
    console.log("⚠️ Rating not found");
    return null;
  }

  function getHighlights() {
    const highlights = [];
    
    const highlightElements = document.querySelectorAll("li._7eSDEY, ul._1h43aV li, div._2418kt li, li[class*='_7eSDEY']");
    
    for (let i = 0; i < highlightElements.length; i++) {
      const text = highlightElements[i].innerText;
      if (text && text.length > 10 && text.length < 200) {
        highlights.push(text.trim());
      }
    }

    if (highlights.length === 0) {
      const descElements = document.querySelectorAll("div._1mXcCf, div._2418kt div, p._2-N8zT, div[class*='_1mXcCf']");
      for (let i = 0; i < descElements.length; i++) {
        const text = descElements[i].innerText;
        if (text && text.length > 50 && text.length < 500) {
          highlights.push(text.trim());
        }
      }
    }

    console.log("📋 Highlights found:", highlights.length);
    return highlights.slice(0, 10);
  }

  function getReviews() {
    const reviews = [];
    const elements = document.querySelectorAll("div.t-ZTKy, div._6K-7Co, div.qwjRop, div[class*='t-ZTKy']");
    
    for (let i = 0; i < elements.length; i++) {
      const text = elements[i].innerText;
      if (text && text.length > 50) {
        const cleaned = text.replace(/READ MORE/gi, "").trim();
        if (cleaned.indexOf("Certified Buyer") === -1 && cleaned.indexOf("Helpful") === -1) {
          reviews.push(cleaned);
        }
      }
    }

    console.log("⭐ Reviews found:", reviews.length);
    return reviews.slice(0, 10);
  }

  function extractData() {
    try {
      console.log("🔍 Starting data extraction...");
      
      const title = getTitle();
      const price = getPrice();
      const image = getImage();
      const rating = getRating();
      const reviews = getReviews();
      const highlights = getHighlights();

      let contentForSummary = reviews;
      if (reviews.length === 0 && highlights.length > 0) {
        contentForSummary = highlights;
        console.log("💡 Using product highlights instead of reviews");
      } else if (reviews.length === 0) {
        contentForSummary = ["No detailed reviews or product information available for analysis."];
        console.log("⚠️ No content available");
      }

      const product = {
        site: "flipkart",
        url: location.href,
        title: title,
        price: price,
        image: image,
        rating: rating,
        reviews: contentForSummary,
        reviewCount: reviews.length,
        hasReviews: reviews.length > 0,
        highlights: highlights
      };

      console.log("📦 Product data extracted successfully");
      console.log("🖼️ Final image URL:", image ? image.substring(0, 100) : "NOT FOUND");

      let retries = 0;
      const sendMessage = () => {
        chrome.runtime.sendMessage(
          { type: "product-data", payload: product },
          function (response) {
            if (chrome.runtime.lastError) {
              console.error("❌ Send attempt failed:", chrome.runtime.lastError.message);
              if (retries < 3) {
                retries++;
                console.log(`🔄 Retrying... (${retries}/3)`);
                setTimeout(sendMessage, 500);
              }
            } else {
              console.log("✅ Data sent successfully to background script");
            }
          }
        );
      };
      
      sendMessage();
    } catch (error) {
      console.error("❌ Extraction error:", error);
    }
  }

  async function init() {
    try {
      console.log("🚀 Initializing Flipkart extractor...");
      await wait(2000); // Wait longer for images to load
      await scrollPage();
      await wait(2000); // Wait longer after scroll
      extractData();
      
      // Retry after additional wait
      setTimeout(() => {
        console.log("🔄 Retrying extraction after 3s...");
        extractData();
      }, 3000);
      
      console.log("✅ Flipkart extractor initialization complete");
    } catch (error) {
      console.error("❌ Initialization error:", error);
    }
  }

  // Start immediately
  if (document.readyState === "complete" || document.readyState === "interactive") {
    console.log("📄 Document already ready, starting immediately");
    init();
  } else {
    console.log("⏳ Waiting for document...");
    document.addEventListener("DOMContentLoaded", init);
    window.addEventListener("load", init);
  }
  
  // Run on tab visibility
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      console.log("👁️ Tab became visible, re-extracting data...");
      init();
    }
  });
})();
