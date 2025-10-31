// amazon.js
(function () {
  try {
    // Wait a bit if page not fully loaded - but run_at document_idle should do
    function extract() {
      const titleEl = document.querySelector('#productTitle');
      const title = titleEl ? titleEl.innerText.trim() : document.title;

      // price may vary in selector
      let price = null;
      const priceSelectors = [
        '.a-price-whole',
        '.a-price .a-offscreen',
        'span[data-a-size="xl"] span.a-offscreen',
        '.apexPriceToPay .a-offscreen',
        '#corePrice_feature_div .a-offscreen',
        '#price',
        '#priceblock_ourprice',
        '#priceblock_dealprice',
        '#priceblock_saleprice'
      ];
      for (const sel of priceSelectors) {
        const el = document.querySelector(sel);
        if (el && el.innerText) {
          price = el.innerText.trim();
          break;
        }
      }

      // Fallback price detection
      if (!price) {
        const allText = document.body.innerText;
        const priceRegex = /[₹$€£]\s*[\d,]+(?:\.\d{2})?/g;
        const matches = allText.match(priceRegex);
        if (matches) {
          // Find the most likely price (e.g., one that appears frequently or near the product title)
          price = matches[0];
        }
      }

      // image
      const image = document.querySelector('#imgTagWrapperId img')?.src || document.querySelector('#landingImage')?.src || null;

      // rating text
      const rating = document.querySelector('#acrPopover')?.getAttribute('title') || document.querySelector('.a-icon-alt')?.innerText || null;

      // reviews - try several selectors
      let reviewEls = Array.from(document.querySelectorAll('[data-hook="review-body"], .review-text-content, [data-hook="review-collapsed"]')) || [];
      if (!reviewEls.length) {
        reviewEls = Array.from(document.querySelectorAll('.review .review-text, .review-text'));
      }
      const reviews = reviewEls.slice(0, 10).map(r => r.innerText.trim()).filter(Boolean);

      const product = {
        site: 'amazon',
        url: location.href,
        title,
        price,
        image,
        rating,
        reviews
      };

      chrome.runtime.sendMessage({ type: 'product-data', payload: product }, (resp) => {
        // optional: console.log('amazon product saved', resp);
      });
    }

    // Delay extraction a bit to let dynamic content load
    setTimeout(extract, 800);
  } catch (err) {
    console.error('amazon extractor error', err);
  }
})();
