// content-scripts/flipkart.js
(function () {
  try {
    function extract() {
      const title =
        document.querySelector("span.B_NuCI")?.innerText?.trim() ||
        document.title;

      const price =
        document.querySelector("div._30jeq3._16Jk6d")?.innerText?.trim() ||
        document.querySelector("div._1vC4OE._3qQ9m1")?.innerText?.trim() ||
        null;

      const image =
        document.querySelector("img._396cs4, img._2r_T1I, img[srcset]")?.src ||
        null;

      const rating =
        document.querySelector("div._3LWZlK, div._2d4LTz")?.innerText?.trim() ||
        null;

      // 🆕 Improved review extraction
      let reviewEls = Array.from(
        document.querySelectorAll("div.t-ZTKy div, div._16PBlm div, div._2-N8zT div")
      );
      const reviews = reviewEls
        .map((r) => r.innerText.trim())
        .filter((txt) => txt.length > 40)
        .slice(0, 6);

      const product = {
        site: "flipkart",
        url: location.href,
        title,
        price,
        image,
        rating,
        reviews,
      };

      console.log("📦 Flipkart extracted:", product);

      chrome.runtime.sendMessage({ type: "product-data", payload: product }, () => {});
    }

    // Wait for Flipkart’s dynamic content to load
    const observer = new MutationObserver(() => {
      const hasTitle = document.querySelector("span.B_NuCI");
      const hasPrice = document.querySelector("div._30jeq3._16Jk6d");
      if (hasTitle && hasPrice) {
        observer.disconnect();
        setTimeout(extract, 800);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // fallback after 3s if observer doesn’t trigger
    setTimeout(extract, 3000);
  } catch (e) {
    console.error("flipkart extractor error", e);
  }
})();
