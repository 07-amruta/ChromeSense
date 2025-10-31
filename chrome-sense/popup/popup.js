// popup.js
import { summarizeReviews, generateComparison, checkAIAvailability } from "../modules/ai-wrapper.js";
import { parsePrice } from "../modules/helpers.js";

// ==================== GLOBAL STATE ====================
let currentProducts = [];

// ==================== DOM ELEMENTS ====================
const grid = document.getElementById("grid");
const emptyState = document.getElementById("emptyState");
const smartCompareSection = document.getElementById("smartCompareSection");
const smartCompareContent = document.getElementById("smartCompareContent");
const compareSpinner = document.getElementById("compareSpinner");
const refreshBtn = document.getElementById("refreshBtn");
const clearBtn = document.getElementById("clearBtn");
const status = document.getElementById("status");

// ==================== INIT ====================
document.addEventListener("DOMContentLoaded", async () => {
  // Check Chrome AI availability
  console.log("🔍 Checking Chrome AI availability...");
  console.log("window.ai:", window.ai);
  
  if (window.ai && window.ai.languageModel) {
    try {
      const capabilities = await window.ai.languageModel.capabilities();
      console.log("✅ Chrome AI capabilities:", capabilities);
    } catch (error) {
      console.error("❌ Chrome AI check failed:", error);
      console.warn("⚠️ Chrome AI not available. Using fallback summarization.");
    }
  } else {
    console.warn("⚠️ Chrome AI not available. Make sure you're using Chrome Dev/Canary with AI enabled.");
  }
  
  await loadProducts();
  
  // Event listeners
  refreshBtn.addEventListener("click", handleRefresh);
  clearBtn.addEventListener("click", handleClear);
});

// ==================== LOAD PRODUCTS ====================
async function loadProducts() {
  updateStatus("Loading products...", "loading");
  
  chrome.runtime.sendMessage({ type: "get-all-products" }, async (response) => {
    currentProducts = response?.products || [];
    
    if (currentProducts.length === 0) {
      showEmptyState();
      updateStatus("No products found", "ready");
    } else {
      hideEmptyState();
      renderProducts(currentProducts);
      
      // Generate AI comparison if 2+ products
      if (currentProducts.length >= 2) {
        await generateSmartComparison(currentProducts);
      } else {
        smartCompareSection.style.display = "none";
      }
      
      updateStatus(`${currentProducts.length} products loaded`, "ready");
    }
  });
}

// ==================== RENDER PRODUCTS ====================
function renderProducts(products) {
  grid.innerHTML = "";
  
  products.forEach((product, index) => {
    const card = createProductCard(product, index);
    grid.appendChild(card);
  });
}

// ==================== CREATE PRODUCT CARD ====================
function createProductCard(product, index) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.style.animationDelay = `${index * 0.1}s`;
  
  const site = product.site || "unknown";
  const siteClass = site === "amazon" ? "amazon" : "flipkart";
  const siteName = site === "amazon" ? "Amazon" : "Flipkart";
  
  card.innerHTML = `
    <div class="product-card-header">
      ${product.image ? `<img src="${product.image}" alt="${product.title}" class="product-image">` : ""}
      <span class="site-badge-card ${siteClass}">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10"/>
        </svg>
        ${siteName}
      </span>
    </div>
    
    <div class="product-card-body">
      <h3 class="product-title" title="${product.title}">${product.title}</h3>
      
      <div class="product-meta">
        ${product.price ? `<div class="product-price">${product.price}</div>` : '<div class="product-price">N/A</div>'}
        ${product.rating ? `
          <div class="product-rating">
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            ${product.rating}
          </div>
        ` : ""}
      </div>
      
      <div class="ai-summary" id="summary-${index}">
        <div class="ai-summary-header">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          AI Analysis
          <div class="loading-spinner" style="margin-left: auto;"></div>
        </div>
        <div class="summary-content">
          <div class="summary-loading">
            Analyzing reviews with Gemini Nano...
          </div>
        </div>
      </div>
      
      <div class="card-actions">
        <button class="btn-visit" onclick="window.open('${product.url}', '_blank')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
          </svg>
          Visit Product
        </button>
        <button class="btn-remove" data-index="${index}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          Remove
        </button>
      </div>
    </div>
  `;
  
  // Generate AI summary
  setTimeout(() => generateSummary(product, index), 500 + index * 300);
  
  // Remove button handler
  card.querySelector(".btn-remove").addEventListener("click", () => {
    handleRemoveProduct(index);
  });
  
  return card;
}

// ==================== GENERATE AI SUMMARY ====================
async function generateSummary(product, index) {
  const summaryContainer = document.getElementById(`summary-${index}`);
  if (!summaryContainer) return;
  
  const contentDiv = summaryContainer.querySelector(".summary-content");
  
  try {
    const summaryJson = await summarizeReviews(product.reviews || [], product.title);
    const parsed = parseJsonSummary(summaryJson);
    
    contentDiv.innerHTML = `
      ${parsed.pros && parsed.pros.length > 0 ? `
        <div class="summary-section pros">
          <strong>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
            Pros
          </strong>
          <ul>${parsed.pros.map(item => `<li>${item}</li>`).join("")}</ul>
        </div>
      ` : ""}
      
      ${parsed.cons && parsed.cons.length > 0 ? `
        <div class="summary-section cons">
          <strong>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
            </svg>
            Cons
          </strong>
          <ul>${parsed.cons.map(item => `<li>${item}</li>`).join("")}</ul>
        </div>
      ` : ""}
      
      ${(!parsed.pros || parsed.pros.length === 0) && (!parsed.cons || parsed.cons.length === 0) ? `<p style="color: var(--text-muted);">Could not extract pros and cons.</p>` : ""}
      ${parsed.note ? `<p style="color: var(--text-muted); font-size: 12px; margin-top: 8px;"><em>${parsed.note}</em></p>` : ""}
    `;
    
    // Hide spinner
    summaryContainer.querySelector(".loading-spinner").style.display = "none";
    
  } catch (error) {
    console.error("Summary generation failed:", error);
    contentDiv.innerHTML = `<p style="color: var(--text-muted);">Unable to generate AI summary.</p>`;
    summaryContainer.querySelector(".loading-spinner").style.display = "none";
  }
}

// ==================== PARSE SUMMARY ====================
function parseJsonSummary(jsonString) {
  try {
    const startIndex = jsonString.indexOf('{');
    const endIndex = jsonString.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      const jsonPart = jsonString.substring(startIndex, endIndex + 1);
      return JSON.parse(jsonPart);
    }
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse summary JSON:", error, "\nJSON string:", jsonString);
    return { pros: null, cons: null };
  }
}

// ==================== SMART COMPARISON ====================
async function generateSmartComparison(products) {
  if (products.length < 2) return;
  
  smartCompareSection.style.display = "block";
  compareSpinner.style.display = "block";
  smartCompareContent.classList.add("loading");
  smartCompareContent.innerHTML = "Analyzing products...";
  
  try {
    const comparison = await generateComparison(products);
    
    // Check if comparison is HTML or plain text
    if (comparison.includes("<div")) {
      smartCompareContent.innerHTML = comparison;
    } else {
      // Plain text - format it nicely
      smartCompareContent.innerHTML = `
        <div style="padding: 16px;">
          <p style="white-space: pre-wrap; line-height: 1.8;">${comparison}</p>
        </div>
      `;
    }
    
    smartCompareContent.classList.remove("loading");
  } catch (error) {
    console.error("Comparison failed:", error);
    smartCompareContent.innerHTML = `
      <div style="padding: 16px; color: var(--text-muted);">
        <p>Unable to generate comparison. Please try again.</p>
      </div>
    `;
    smartCompareContent.classList.remove("loading");
  } finally {
    compareSpinner.style.display = "none";
  }
}

// ==================== EVENT HANDLERS ====================
async function handleRefresh() {
  updateStatus("Scanning tabs...", "loading");
  refreshBtn.disabled = true;
  
  // Trigger content scripts
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.url && (tab.url.includes("amazon.in") || tab.url.includes("flipkart.com"))) {
        chrome.tabs.reload(tab.id);
      }
    });
  });
  
  // FIXED: Changed timeout from 3000ms to 5000ms
  // This gives content scripts more time to extract and send data
  setTimeout(async () => {
    await loadProducts();
    refreshBtn.disabled = false;
  }, 5000);
}

async function handleClear() {
  if (!confirm("Clear all products?")) return;
  
  chrome.runtime.sendMessage({ type: "clear-all" }, async () => {
    currentProducts = [];
    smartCompareSection.style.display = "none";
    showEmptyState();
    updateStatus("All products cleared", "ready");
  });
}

function handleRemoveProduct(index) {
  const product = currentProducts[index];
  chrome.runtime.sendMessage({ type: "remove-product", payload: { url: product.url } }, async () => {
    await loadProducts();
  });
}

// ==================== UI HELPERS ====================
function showEmptyState() {
  grid.style.display = "none";
  emptyState.style.display = "block";
  smartCompareSection.style.display = "none";
}

function hideEmptyState() {
  grid.style.display = "grid";
  emptyState.style.display = "none";
}

function updateStatus(message, type = "ready") {
  status.querySelector("span").textContent = message;
  status.className = `status-indicator ${type}`;
}
