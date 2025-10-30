// amazon.js
(function () {
  try {
    // Wait a bit if page not fully loaded - but run_at document_idle should do
    function extract() {
      const titleEl = document.querySelector('#productTitle');
      const title = titleEl ? titleEl.innerText.trim() : document.title;

      // price may vary in selector
      let price = null;
      const priceSelectors = ['#priceblock_ourprice', '#priceblock_dealprice', '.a-price .a-offscreen', '#priceblock_saleprice'];
      for (const sel of priceSelectors) {
        const el = document.querySelector(sel);
        if (el && el.innerText) { price = el.innerText.trim(); break; }
      }

      // image
      const image = document.querySelector('#imgTagWrapperId img')?.src || document.querySelector('#landingImage')?.src || null;

      // rating text
      const rating = document.querySelector('#acrPopover')?.getAttribute('title') || document.querySelector('.a-icon-alt')?.innerText || null;

      // reviews - try several selectors
      let reviewEls = Array.from(document.querySelectorAll('.review-text-content, .a-expander-content, .review-data')) || [];
      if (!reviewEls.length) {
        reviewEls = Array.from(document.querySelectorAll('.review .review-text, .review-text'));
      }
      const reviews = reviewEls.slice(0, 6).map(r => r.innerText.trim()).filter(Boolean);

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
