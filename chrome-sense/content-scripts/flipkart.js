// content-scripts/flipkart.js
(function () {
  console.log("Flipkart content script (delayed extractor) running…");

  function getText(selectors) {
    for (const s of selectors) {
      const el = document.querySelector(s);
      if (el && el.innerText.trim()) return el.innerText.trim();
    }
    return "";
  }

  function getImage() {
    const img =
      document.querySelector("img._396cs4, img._2r_T1I, img[srcset]");
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

  // Wait for product DOM to appear
  const observer = new MutationObserver(() => {
    const product = extractProduct();
    if (product && product.title) {
      console.log("Flipkart product extracted:", product);
      chrome.runtime.sendMessage({ type: "product-info", product });
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // fallback timeout
  setTimeout(() => {
    const product = extractProduct();
    if (product && product.title) {
      console.log("Flipkart fallback extracted:", product);
      chrome.runtime.sendMessage({ type: "product-info", product });
    }
  }, 4000);
})();
