// popup.js
(async function () {
  // Utility to load module file as script text and evaluate in a module-like scope
  async function loadModule(path) {
    const res = await fetch(path);
    const text = await res.text();
    // wrap in function to emulate module exports object
    const wrapper = `(function(exports){${text}\nreturn exports;})({})`;
    return eval(wrapper);
  }

  // Load modules
  let aiModule = null;
  let helpers = null;
  try {
    aiModule = await loadModule('../modules/ai-wrapper.js');
  } catch (e) {
    console.error('Failed to load ai-wrapper', e);
    aiModule = { summarizeReviews: async (r) => 'Summary module load failed.' };
  }

  try {
    helpers = await loadModule('../modules/helpers.js');
  } catch (e) {
    console.error('Failed to load helpers', e);
    helpers = { parsePrice: (p) => null, similarTitle: () => 0 };
  }

  const refreshBtn = document.getElementById('refreshBtn');
  const clearBtn = document.getElementById('clearBtn');
  const statusEl = document.getElementById('status');
  const contentEl = document.getElementById('content');

  refreshBtn.addEventListener('click', loadProducts);
  clearBtn.addEventListener('click', clearProducts);

  // initial load
  loadProducts();

  function setStatus(s) { statusEl.innerText = s; }

  function clearProducts() {
    setStatus('Clearing cache...');
    chrome.runtime.sendMessage({ type: 'clear-products' }, (resp) => {
      setStatus('Cleared.');
      renderNoProducts('No products found. Open product pages (Amazon/Flipkart) and click Refresh.');
    });
  }

  function renderNoProducts(text) {
    contentEl.innerHTML = `<div style="padding:18px;color:#6b7280">${text}</div>`;
  }

  function renderTable(products) {
    if (!products || !products.length) {
      renderNoProducts('No products found. Open product pages (Amazon/Flipkart) and click Refresh.');
      return;
    }

    // Build cards grid
    const grid = document.createElement('div');
    grid.className = 'grid';

    // For each product render a card
    products.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = 'card';

      const img = document.createElement('img');
      img.src = p.image || '';
      img.alt = p.title || '';
      card.appendChild(img);

      const h = document.createElement('h4');
      h.innerText = p.title || '(No title)';
      card.appendChild(h);

      const price = document.createElement('div');
      price.className = 'price';
      price.innerText = p.price || '—';
      card.appendChild(price);

      const rating = document.createElement('div');
      rating.className = 'rating';
      rating.innerText = p.rating ? `Rating: ${p.rating}` : '';
      card.appendChild(rating);

      const summary = document.createElement('div');
      summary.className = 'summary';
      summary.id = `summary-${idx}`;
      summary.innerText = '[summarizing reviews…]';
      card.appendChild(summary);

      const link = document.createElement('a');
      link.href = p.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.innerText = 'Open product';
      link.style.fontSize = '12px';
      link.style.marginTop = '8px';
      card.appendChild(link);

      grid.appendChild(card);
    });

    // render grid into content
    contentEl.innerHTML = '';
    contentEl.appendChild(grid);

    // Summarize each product reviews
    products.forEach(async (p, idx) => {
      const el = document.getElementById(`summary-${idx}`);
      try {
        const summary = await aiModule.summarizeReviews(p.reviews || []);
        el.innerText = summary;
      } catch (e) {
        console.error('summarize error', e);
        el.innerText = '[summary failed]';
      }
    });
  }

  function relativeSort(products) {
    // bring items with price numbers to top (cheap first)
    const withPrice = products.filter(p => helpers.parsePrice(p.price) !== null);
    const without = products.filter(p => helpers.parsePrice(p.price) === null);
    withPrice.sort((a,b) => (helpers.parsePrice(a.price) || 1e12) - (helpers.parsePrice(b.price) || 1e12));
    return withPrice.concat(without);
  }

  function groupSimilar(products) {
    // For MVP we simply return products as is
    return products;
  }

  function loadProducts() {
    setStatus('Loading products...');
    chrome.runtime.sendMessage({ type: 'get-all-products' }, (resp) => {
      const products = resp.products || [];
      // basic normalization
      const normalized = products.map(p => ({
        ...p,
        priceValue: helpers.parsePrice(p.price),
        shortTitle: p.title ? (p.title.length > 80 ? p.title.slice(0,80)+'…' : p.title) : ''
      }));

      const sorted = relativeSort(normalized);
      const grouped = groupSimilar(sorted);
      renderTable(grouped);
      setStatus(`${grouped.length} product(s) found`);
    });
  }

})();
