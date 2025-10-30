// content-scripts/flipkart.js
(function () {
  console.log("Flipkart content script running...");

  function getText(selector) {
    const el = document.querySelector(selector);
    return el ? el.innerText.trim() : "";
  }

  function getImage() {
    // Flipkart uses lazy-loaded img or source sets
    const imgEl =
      document.querySelector("img._396cs4") ||
      document.querySelector("img.DByuf4") ||
      document.querySelector("img._2r_T1I") ||
      document.querySelector("img[srcset]");

    if (imgEl?.src && !imgEl.src.includes("data:")) return imgEl.src;
    if (imgEl?.getAttribute("srcset")) {
      return imgEl.getAttribute("srcset").split(",")[0].split(" ")[0];
    }
    return "";
  }

  function getReviews() {
    const reviewEls = document.querySelectorAll("div.t-ZTKy div");
    const reviews = [];
    reviewEls.forEach((el) => {
      const txt = el.innerText.trim();
      if (txt && txt.length > 30) reviews.push(txt);
    });
    return reviews.slice(0, 10);
  }

  function getRating() {
    const r =
      getText("div._3LWZlK") ||
      getText("div._2d4LTz") ||
      getText("._1lRcqv") ||
      "";
    return r ? `Rating: ${r} out of 5` : "";
  }

  function getPrice() {
    return (
      getText("div._30jeq3._16Jk6d") ||
      getText("div._25b18c div") ||
      getText("._1vC4OE") ||
      ""
    );
  }

  const title =
    getText("span.B_NuCI") ||
    getText("span.a-size-large") ||
    document.title.split("|")[0].trim();

  const product = {
    title,
    price: getPrice(),
    rating: getRating(),
    image: getImage(),
    reviews: getReviews(),
    url: location.href,
    source: "flipkart",
  };

  console.log("Extracted Flipkart product:", product);
  chrome.runtime.sendMessage({ type: "product-info", product });
})();
