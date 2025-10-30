// content-scripts/flipkart.js
(function () {
  console.log("🟦 Flipkart extractor started…");

  async function autoScrollToLoad() {
    let lastHeight = 0;
    for (let i = 0; i < 10; i++) {
      window.scrollBy(0, 600);
      await new Promise((r) => setTimeout(r, 600));
      const newHeight = document.body.scrollHeight;
      if (newHeight === lastHeight) break;
      lastHeight = newHeight;
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 800));
  }

  function extract() {
    // Enhanced title selectors with multiple fallbacks
    let title = null;
    const titleSelectors = [
      "span.B_NuCI",
      "span.VU-ZEz",
      "h1.yhB1nd",
      ".B_NuCI",
      "h1"
    ];

    for (let selector of titleSelectors) {
      const el = document.querySelector(selector);
      if (el && el.innerText && el.innerText.trim()) {
        title = el.innerText.trim();
        break;
      }
    }

    if (!title) {
      title = document.title.split("|")[0].split("-")[0].trim();
    }

    console.log("📌 Title found:", title);

    let price = null;
    const priceSelectors = [
      "div._30jeq3._16Jk6d",
      "div._1vC4OE._3qQ9m1",
      "div._30jeq3",
      "div._16Jk6d"
    ];

    for (let selector of priceSelectors) {
      const el = document.querySelector(selector);
      if (el && el.innerText) {
        price = el.innerText.trim();
        break;
      }
    }

    let image = null;
    const imageSelectors = [
      "img._396cs4",
      "img._2r_T1I",
      "img._53J4C-",
      "div._3kidJX img",
      "img[srcset]"
    ];

    for (let selector of imageSelectors) {
      const el = document.querySelector(selector);
      if (el && el.src) {
        image = el.src;
        break;
      }
    }

    let rating = null;
    const ratingSelectors = [
      "div._3LWZlK",
      "div._2d4LTz",
      "span._1lRcqv"
    ];

    for (let selector of ratingSelectors) {
      const el = document.querySelector(selector);
      if (el && el.innerText) {
        rating = el.innerText.trim();
        break;
      }
    }

    // Review extraction
    let reviews = [];
    const reviewSelectors = [
      "div.t-ZTKy",
      "div._6K-7Co",
      "div.qwjRop",
      "div._2-N8zT div",
      "div.ZmyHeo div"
    ];

    for (let selector of reviewSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        const tempReviews = Array.from(elements)
          .map((el) => {
            if (!el.innerText) return "";
            let text = el.innerText.trim();
            text = text.replace(/READ MORE/gi, "").trim();
            return text;
          })
          .filter((txt) => {
            return (
              txt.length > 50 &&
              txt.indexOf("Certified Buyer") === -1 &&
              txt.indexOf("Helpful") === -1 &&
              txt.indexOf("₹") !== 0
            );
          });

        if (tempReviews.length > reviews.length) {
          reviews = tempReviews;
        }
      }
    }

    reviews = reviews.slice(0, 10);

    if (reviews.length === 0) {
      console.log("⚠️ No reviews found");
      reviews = ["No detailed reviews available for analysis."];
    }

    const product = {
      site: "flipkart",
      url: location.href,
      title: title,
      price: price,
      image: image,
      rating: rating,
      reviews: reviews,
      reviewCount: reviews.length
    };

    console.log("📦 Flipkart extracted:", product);
    console.log("✅ Found " + reviews.length + " reviews");

    chrome.runtime.sendMessage(
      { type: "product-data", payload: product },
      function (response) {
        if (chrome.runtime.lastError) {
          console.error("❌ Message send failed:", chrome.runtime.lastError);
        } else {
          console.log("✅ Message sent successfully", response);
        }
      }
    );
  }

  async function initExtractor() {
    try {
      await autoScrollToLoad();

      let attempts = 0;
      const maxAttempts = 10;

      const checkReady = setInterval(function () {
        attempts = attempts + 1;

        const titleEl1 = document.querySelector("span.B_NuCI");
        const titleEl2 = document.querySelector("span.VU-ZEz");
        const titleEl3 = document.querySelector("h1");

        if (titleEl1 || titleEl2 || titleEl3 || attempts >= maxAttempts) {
          clearInterval(checkReady);
          console.log("✅ Ready to extract (attempt " + attempts + ")");
          setTimeout(extract, 1000);
        } else {
          console.log("⏳ Waiting for elements... (attempt " + attempts + ")");
        }
      }, 500);
    } catch (e) {
      console.error("❌ Flipkart extractor failed:", e);
      extract();
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(initExtractor, 1000);
  } else {
    window.addEventListener("load", initExtractor);
  }
})();
