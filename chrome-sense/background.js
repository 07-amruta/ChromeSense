// background.js
const STORE_KEY = "chrome_sense_products";

// ───────────────────────────── INSTALL HANDLER ─────────────────────────────
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

  // 🆕 Scan all open tabs for product pages
  if (msg.type === "scan-tabs") {
    scanAllProductTabs().then((products) => sendResponse({ products }));
    return true;
  }
});

// ───────────────────────────── CORE FUNCTIONS ─────────────────────────────
async function scanAllProductTabs() {
  const tabs = await chrome.tabs.query({ url: ["*://*.amazon.in/*", "*://*.flipkart.com/*"] });

  console.log("🔍 Found product tabs:", tabs.map((t) => t.url));

  const injectionPromises = tabs.map(async (tab) => {
    try {
      // Wait until tab is completely loaded
      await waitForTabReady(tab.id);

      const scriptFile = tab.url.includes("flipkart.com")
        ? "content-scripts/flipkart.js"
        : "content-scripts/amazon.js";

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: [scriptFile],
      });

      console.log(`✅ Injected ${scriptFile} into ${tab.url}`);
    } catch (err) {
      console.warn(`⚠️ Could not inject into ${tab.url}`, err);
    }
  });

  await Promise.allSettled(injectionPromises);

  // Wait for messages from injectors to complete storage writes
  await new Promise((r) => setTimeout(r, 2500));

  const { [STORE_KEY]: products = [] } = await chrome.storage.local.get(STORE_KEY);
  console.log("📦 Products after scan:", products);
  return products;
}

async function waitForTabReady(tabId) {
  for (let i = 0; i < 10; i++) {
    const tab = await chrome.tabs.get(tabId);
    if (tab.status === "complete") return true;
    await new Promise((r) => setTimeout(r, 300));
  }
  return true;
}

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
