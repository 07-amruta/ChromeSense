// content-scripts/flipkart.js
(function () {
  console.log("Flipkart extractor started");

  function wait(ms) {
    return new Promise(function(resolve) {
      setTimeout(resolve, ms);
    });
  }

  async function scrollPage() {
    for (let i = 0; i < 8; i++) {
      window.scrollBy(0, 500);
      await wait(500);
    }
    window.scrollTo(0, 0);
    await wait(800);
  }

  function getTitle() {
    const selectors = ["span.B_NuCI", "span.VU-ZEz", "h1.yhB1nd", "h1"];
    for (let i = 0; i < selectors.length; i++) {
      const el = document.querySelector(selectors[i]);
      if (el && el.innerText) {
        return el.innerText.trim();
      }
    }
    return document.title.split("|")[0].trim();
  }

  function getPrice() {
    let price = null;
    
    // Primary price selectors
    const priceSelectors = [
      "div._30jeq3._16Jk6d",
      "div._30jeq3",
      "div._16Jk6d",
      "div._1vC4OE._3qQ9m1",
      "div._25b18c div"
    ];

    for (let i = 0; i < priceSelectors.length; i++) {
      const el = document.querySelector(priceSelectors[i]);
      if (el && el.innerText && el.innerText.trim().startsWith("₹")) {
        price = el.innerText.trim();
        break;
      }
    }

    // Fallback: Find any element containing price pattern
    if (!price) {
      const allDivs = document.querySelectorAll("div");
      for (let div of allDivs) {
        const text = div.innerText;
        if (text && text.match(/^₹[\d,]+$/)) {
          price = text.trim();
          break;
        }
      }
    }

    console.log("💰 Price extracted:", price);
    return price;
  }

  function getImage() {
    let image = null;
    
    // Primary image selectors for Flipkart
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
        break;
      }
    }

    // Fallback: Find largest product image
    if (!image) {
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
      }
    }

    console.log("🖼️ Image extracted:", image);
    return image;
  }

  function getRating() {
    const selectors = ["div._3LWZlK", "div._2d4LTz"];
    for (let i = 0; i < selectors.length; i++) {
      const el = document.querySelector(selectors[i]);
      if (el && el.innerText) {
        return el.innerText.trim();
      }
    }
    return null;
  }

  function getHighlights() {
    const highlights = [];
    
    // Try to get highlights/key features
    const highlightElements = document.querySelectorAll("li._7eSDEY, ul._1h43aV li, div._2418kt li");
    
    for (let i = 0; i < highlightElements.length; i++) {
      const text = highlightElements[i].innerText;
      if (text && text.length > 10 && text.length < 200) {
        highlights.push(text.trim());
      }
    }

    // Try to get product description if no highlights
    if (highlights.length === 0) {
      const descElements = document.querySelectorAll("div._1mXcCf, div._2418kt div, p._2-N8zT");
      for (let i = 0; i < descElements.length; i++) {
        const text = descElements[i].innerText;
        if (text && text.length > 50 && text.length < 500) {
          highlights.push(text.trim());
        }
      }
    }

    return highlights.slice(0, 10);
  }

  function getReviews() {
    const reviews = [];
    const elements = document.querySelectorAll("div.t-ZTKy, div._6K-7Co, div.qwjRop");
    
    for (let i = 0; i < elements.length; i++) {
      const text = elements[i].innerText;
      if (text && text.length > 50) {
        const cleaned = text.replace(/READ MORE/gi, "").trim();
        if (cleaned.indexOf("Certified Buyer") === -1 && cleaned.indexOf("Helpful") === -1) {
          reviews.push(cleaned);
        }
      }
    }

    return reviews.slice(0, 10);
  }

  function extractData() {
    const title = getTitle();
    const price = getPrice();
    const image = getImage();
    const rating = getRating();
    const reviews = getReviews();
    const highlights = getHighlights();

    // If no reviews, use product highlights as content
    let contentForSummary = reviews;
    if (reviews.length === 0 && highlights.length > 0) {
      contentForSummary = highlights;
      console.log("No reviews found, using product highlights instead");
    } else if (reviews.length === 0) {
      contentForSummary = ["No detailed reviews or product information available for analysis."];
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

    console.log("Flipkart data extracted:", product);
    console.log("Image URL:", image);

    chrome.runtime.sendMessage(
      { type: "product-data", payload: product },
      function (response) {
        if (chrome.runtime.lastError) {
          console.error("Send failed:", chrome.runtime.lastError.message);
        } else {
          console.log("Data sent successfully");
        }
      }
    );
  }

  async function init() {
    console.log("Initializing Flipkart extractor...");
    await scrollPage();
    await wait(2500); // Increased wait time for images to load
    extractData();
  }

  if (document.readyState === "complete") {
    init();
  } else {
    window.addEventListener("load", function() {
      setTimeout(init, 1500);
    });
  }
})();
