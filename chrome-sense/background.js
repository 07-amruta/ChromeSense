// background.js
const STORE_KEY = "chrome_sense_products";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ [STORE_KEY]: [] });
  chrome.contextMenus.create({
    id: "compare-products",
    title: "Open ChromeSense",
    contexts: ["action"],
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "compare-products") chrome.action.openPopup();
});

// ───────────────────────────── MESSAGE HANDLER ─────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "product-data") {
    const product = msg.payload || {};
    if (sender?.tab?.id) product.tabId = sender.tab.id;
    saveOrUpdateProduct(product).then(() => sendResponse({ ok: true }));
    return true;
  }

  if (msg.type === "get-all-products") {
    chrome.storage.local.get(STORE_KEY, (res) => {
      sendResponse({ products: res[STORE_KEY] || [] });
    });
    return true;
  }

  if (msg.type === "clear-products") {
    chrome.storage.local.set({ [STORE_KEY]: [] }, () => sendResponse({ ok: true }));
    return true;
  }

  // 🆕 Scan all open tabs for products
  if (msg.type === "scan-tabs") {
    scanAllProductTabs(sendResponse);
    return true; // keep async channel open
  }
});

// ───────────────────────────── CORE FUNCTIONS ─────────────────────────────
async function scanAllProductTabs(sendResponse) {
  const tabs = await chrome.tabs.query({});
  const productTabs = tabs.filter(
    (t) =>
      t.url.includes("amazon.in") || t.url.includes("flipkart.com")
  );

  console.log("🔍 Scanning product tabs:", productTabs.map((t) => t.url));

  for (const tab of productTabs) {
    try {
      if (tab.url.includes("flipkart.com")) {
        await injectExtractor(tab.id, "content-scripts/flipkart.js");
      } else if (tab.url.includes("amazon.in")) {
        await injectExtractor(tab.id, "content-scripts/amazon.js");
      }
    } catch (e) {
      console.warn("Injection failed for tab", tab.id, e);
    }
  }

  // wait for data collection
  setTimeout(() => {
    chrome.storage.local.get(STORE_KEY, (res) => {
      sendResponse({ products: res[STORE_KEY] || [] });
    });
  }, 2500);
}

// Dynamically injects a given content script into a tab
async function injectExtractor(tabId, file) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: [file],
    });
    console.log("✅ Injected:", file, "into tab:", tabId);
  } catch (e) {
    console.error("Injection error:", e);
  }
}

// Save or update products in storage
async function saveOrUpdateProduct(product) {
  const data = await new Promise((resolve) =>
    chrome.storage.local.get(STORE_KEY, (r) => resolve(r[STORE_KEY] || []))
  );

  product.timestamp = Date.now();
  const existingIndex = data.findIndex((p) => p.url === product.url);

  if (existingIndex >= 0)
    data[existingIndex] = Object.assign({}, data[existingIndex], product);
  else data.push(product);

  await new Promise((resolve) =>
    chrome.storage.local.set({ [STORE_KEY]: data }, () => resolve())
  );
}
