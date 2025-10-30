// flipkart.js
(function () {
  try {
    function extract() {
      const title = document.querySelector('span.B_NuCI')?.innerText?.trim() || document.title;

      const price = document.querySelector('div._30jeq3._16Jk6d')?.innerText?.trim()
        || document.querySelector('div._1vC4OE._3qQ9m1')?.innerText?.trim()
        || null;

      const image = document.querySelector('img._396cs4._2amPTt._3qGmMb')?.src
        || document.querySelector('img._2r_T1I')?.src
        || null;

      const rating = document.querySelector('div._3LWZlK')?.innerText || null;

      let reviewEls = Array.from(document.querySelectorAll('div._16PBlm, div._2-N8zT, div._2LaGin')) || [];
      const reviews = reviewEls.slice(0, 6).map(r => r.innerText.trim()).filter(Boolean);

      const product = {
        site: 'flipkart',
        url: location.href,
        title,
        price,
        image,
        rating,
        reviews
      };

      chrome.runtime.sendMessage({ type: 'product-data', payload: product }, (resp) => {
        // optional
      });
    }

    setTimeout(extract, 800);
  } catch (e) {
    console.error('flipkart extractor', e);
  }
})();
