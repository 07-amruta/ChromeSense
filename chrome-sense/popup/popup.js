// popup.js
import { summarizeReviews } from "../modules/ai-wrapper.js";
import { parsePrice, similarTitle } from "../modules/helpers.js";

document.addEventListener("DOMContentLoaded", () => {
  const refreshBtn = document.getElementById("refreshBtn");
  const clearBtn = document.getElementById("clearBtn");
  const statusEl = document.getElementById("status");
  const contentEl = document.getElementById("content");

  refreshBtn.addEventListener("click", loadProducts);
  clearBtn.addEventListener("click", clearProducts);

  // initial load
  loadProducts();

  // ---------------- Core UI helpers ----------------
  function setStatus(text) {
    statusEl.innerText = text;
  }

  function renderNoProducts(text) {
    contentEl.innerHTML = `<div style="padding:18px;color:#6b7280">${text}</div>`;
  }

  function clearProducts() {
    setStatus("Clearing cache...");
    chrome.runtime.sendMessage({ type: "clear-products" }, () => {
      setStatus("Cleared.");
      renderNoProducts(
        "No products found. Open product pages (Amazon/Flipkart) and click Refresh."
      );
    });
  }

  // ---------------- Product rendering ----------------
  function renderTable(products) {
    if (!products || !products.length) {
      renderNoProducts(
        "No products found. Open product pages (Amazon/Flipkart) and click Refresh."
      );
      return;
    }

    const grid = document.createElement("div");
    grid.className = "grid";

    products.forEach((p, idx) => {
      const card = document.createElement("div");
      card.className = "card";

      // product image
      const img = document.createElement("img");
      img.src = p.image || "";
      img.alt = p.title || "";
      card.appendChild(img);

      // product title
      const title = document.createElement("h4");
      title.innerText = p.title || "(No title)";
      card.appendChild(title);

      // price
      const price = document.createElement("div");
      price.className = "price";
      price.innerText = p.price || "—";
      card.appendChild(price);

      // rating
      const rating = document.createElement("div");
      rating.className = "rating";
      rating.innerText = p.rating ? `Rating: ${p.rating}` : "";
      card.appendChild(rating);

      // summary placeholder
      const summary = document.createElement("div");
      summary.className = "summary";
      summary.id = `summary-${idx}`;
      summary.innerText = "[summarizing reviews…]";
      card.appendChild(summary);

      // link
      const link = document.createElement("a");
      link.href = p.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.innerText = "Open product";
      link.style.fontSize = "12px";
      link.style.marginTop = "8px";
      card.appendChild(link);

      grid.appendChild(card);
    });

    // render grid
    contentEl.innerHTML = "";
    contentEl.appendChild(grid);

    // summarize each product
    products.forEach(async (p, idx) => {
      const el = document.getElementById(`summary-${idx}`);
      try {
        const summary = await summarizeReviews(p.reviews || []);
        el.innerText = summary;
      } catch (err) {
        console.error("Summary failed:", err);
        el.innerText = "[summary failed]";
      }
    });
  }

  // ---------------- Sorting and grouping ----------------
  function relativeSort(products) {
    const withPrice = products.filter((p) => parsePrice(p.price) !== null);
    const without = products.filter((p) => parsePrice(p.price) === null);
    withPrice.sort(
      (a, b) =>
        (parsePrice(a.price) || 1e12) - (parsePrice(b.price) || 1e12)
    );
    return withPrice.concat(without);
  }

  function groupSimilar(products) {
    // placeholder for smarter grouping later
    return products;
  }

  // ---------------- Main data flow ----------------
  function loadProducts() {
    setStatus("Loading products...");
    chrome.runtime.sendMessage({ type: "get-all-products" }, (resp) => {
      const products = resp?.products || [];
      const normalized = products.map((p) => ({
        ...p,
        priceValue: parsePrice(p.price),
        shortTitle: p.title
          ? p.title.length > 80
            ? p.title.slice(0, 80) + "…"
            : p.title
          : "",
      }));

      const sorted = relativeSort(normalized);
      const grouped = groupSimilar(sorted);
      renderTable(grouped);
      setStatus(`${grouped.length} product(s) found`);
    });
  }
});
