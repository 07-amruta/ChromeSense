// background.js
const STORE_KEY = 'chrome_sense_products';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ [STORE_KEY]: [] });
  chrome.contextMenus.create({
    id: 'compare-products',
    title: 'Open ChromeSense',
    contexts: ['action']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'compare-products') {
    chrome.action.openPopup();
  }
});

// Save product data from content scripts
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'product-data') {
    const product = msg.payload || {};
    // attach tabId if available
    if (sender && sender.tab && sender.tab.id) product.tabId = sender.tab.id;
    saveOrUpdateProduct(product).then(() => sendResponse({ ok: true }));
    return true; // keep channel open for async response
  }

  if (msg.type === 'get-all-products') {
    chrome.storage.local.get(STORE_KEY, (res) => {
      sendResponse({ products: res[STORE_KEY] || [] });
    });
    return true;
  }

  if (msg.type === 'clear-products') {
    chrome.storage.local.set({ [STORE_KEY]: [] }, () => sendResponse({ ok: true }));
    return true;
  }
});

async function saveOrUpdateProduct(product) {
  const data = await new Promise(resolve => chrome.storage.local.get(STORE_KEY, r => resolve(r[STORE_KEY] || [])));
  product.timestamp = Date.now();
  // Try to merge by url
  const existingIndex = data.findIndex(p => p.url === product.url);
  if (existingIndex >= 0) data[existingIndex] = Object.assign({}, data[existingIndex], product);
  else data.push(product);
  await new Promise(resolve => chrome.storage.local.set({ [STORE_KEY]: data }, () => resolve()));
}
