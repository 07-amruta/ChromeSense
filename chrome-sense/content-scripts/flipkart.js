// content-scripts/flipkart.js
(function () {
  console.log("Flipkart content script (safe) running...");

  function safeQueryText(...selectors) {
    for (const s of selectors) {
      const el = document.querySelector(s);
      if (el && el.innerText.trim()) return el.innerText.trim();
    }
    return "";
  }

  function safeQueryAttr(...selectors) {
    for (const s of selectors) {
      const el = document.querySelector(s);
      if (el && el.src) return el.src;
      if (el && el.getAttribute("srcset")) {
        return el.getAttribute("srcset").split(",")[0].split(" ")[0];
      }
    }
    return "";
  }

  function getReviews() {
    const reviews = [];
    document.querySelectorAll("div._27M-vq div.t-ZTKy div").forEach((el) => {
      const txt = el.innerText.trim();
      if (txt.length > 50) reviews.push(txt);
    });
    return reviews.slice(0, 5);
  }

  const product = {
    title: safeQueryText("span.B_NuCI", "h1.yhB1nd", "h1"),
    price: safeQueryText("div._30jeq3._16Jk6d", "div._25b18c div"),
    rating: safeQueryText("div._3LWZlK", "div._2d4LTz", "._1lRcqv"),
    image: safeQueryAttr("img._396cs4", "img._2r_T1I", "img[srcset]"),
    reviews: getReviews(),
    url: location.href,
    source: "flipkart",
  };

  if (!product.title) {
    console.warn("Flipkart product not detected on this page");
    return;
  }

  console.log("Flipkart product extracted:", product);
  chrome.runtime.sendMessage({ type: "product-info", product });
})();
