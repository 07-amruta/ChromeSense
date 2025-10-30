// content-scripts/flipkart.js
(function () {
  console.log("🟦 Flipkart extractor starting...");

  function wait(ms) {
    return new Promise(function(resolve) {
      setTimeout(resolve, ms);
    });
  }

  // Extract data immediately - don't wait for user
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
    let image = null;
    
    const imageSelectors = [
      "img._396cs4",
      "img._2r_T1I", 
      "img._53J4C-",
      "div._1AtVbE img",
      "div._3kidJX img",
      "img[class*='_396cs4']",
      "div[class*='_1AtVbE'] img"
    ];

    for (let i = 0; i < imageSelectors.length; i++) {
      const el = document.querySelector(imageSelectors[i]);
      if (el && el.src && !el.src.includes("placeholder") && !el.src.includes("data:image")) {
        image = el.src;
        console.log("✅ Image found");
        break;
      }
    }

    if (!image) {
      console.log("⚠️ Trying fallback image detection...");
      const allImages = document.querySelectorAll("img");
      let largestImage = null;
      let maxSize = 0;

      for (let img of allImages) {
        if (img.src && 
            img.src.includes("rukminim") && 
            !img.src.includes("placeholder") &&
            img.naturalWidth > 100 && 
            img.naturalHeight > 100) {
          const size = img.naturalWidth * img.naturalHeight;
          if (size > maxSize) {
            maxSize = size;
            largestImage = img.src;
          }
        }
      }
      
      if (largestImage) {
        image = largestImage;
        console.log("✅ Image found via fallback");
      }
    }

    console.log("🖼️ Image extracted");
    return image;
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
      await wait(1000);
      await scrollPage();
      await wait(500);
      extractData();
      console.log("✅ Flipkart extractor initialization complete");
    } catch (error) {
      console.error("❌ Initialization error:", error);
    }
  }

  // Start immediately - don't wait for user interaction
  if (document.readyState === "complete" || document.readyState === "interactive") {
    console.log("📄 Document already ready, starting immediately");
    init();
  } else {
    console.log("⏳ Waiting for document...");
    document.addEventListener("DOMContentLoaded", init);
    window.addEventListener("load", init);
  }
  
  // Also run on tab visibility change (when user switches tabs)
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      console.log("👁️ Tab became visible, re-extracting data...");
      init();
    }
  });
})();
