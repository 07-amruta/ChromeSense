// content-scripts/flipkart.js
(function () {
  console.log("Flipkart content script (safe async extractor) running…");

  // Small utility helpers
  function getText(selectors) {
    for (const s of selectors) {
      const el = document.querySelector(s);
      if (el && el.innerText.trim()) return el.innerText.trim();
    }
    return "";
  }

  function getImage() {
    const img = document.querySelector("img._396cs4, img._2r_T1I, img[srcset]");
    if (!img) return "";
    if (img.src && !img.src.startsWith("data:")) return img.src;
    const set = img.getAttribute("srcset");
    return set ? set.split(",")[0].split(" ")[0] : "";
  }

  function getReviews() {
    const texts = [];
    document.querySelectorAll("div.t-ZTKy div").forEach((el) => {
      const txt = el.innerText.trim();
      if (txt.length > 40) texts.push(txt);
    });
    return texts.slice(0, 6);
  }

  function extractProduct() {
    const title = getText(["span.B_NuCI", "h1.yhB1nd", "h1"]);
    if (!title) return null;

    const price = getText(["div._30jeq3._16Jk6d", "div._25b18c div"]);
    const rating = getText(["div._3LWZlK", "div._2d4LTz"]);
    const image = getImage();
    const reviews = getReviews();

    return {
      title,
      price,
      rating: rating ? `Rating: ${rating} / 5` : "",
      image,
      reviews,
      url: location.href,
      source: "flipkart",
    };
  }

  // --- Main function (runs once DOM is truly ready) ---
  function safeRunExtraction() {
    // Double-check page type
    const productCheck = document.querySelector("span.B_NuCI, h1.yhB1nd");
    if (!productCheck) {
      console.log("Flipkart: product info not yet available. Waiting...");
      setTimeout(safeRunExtraction, 2000);
      return;
    }

    const product = extractProduct();
    if (product && product.title) {
      console.log("✅ Flipkart product extracted:", product);
      chrome.runtime.sendMessage({ type: "product-info", product });
    } else {
      console.warn("Flipkart: unable to extract product data.");
    }
  }

  // --- Ensure Flipkart's React app is fully mounted ---
  window.addEventListener("load", () => {
    // Delay actual scraping slightly so Flipkart JS finishes first
    setTimeout(safeRunExtraction, 2500);
  });
})();
