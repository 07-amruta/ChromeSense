// popup.js
import { summarizeReviews } from "../modules/ai-wrapper.js";
import { parsePrice } from "../modules/helpers.js";

// ---------- SMART COMPARE: AI-powered product comparison ----------
async function generateSmartCompare(products) {
  if (!products || products.length < 2) return "";

  const context = products
    .map(
      (p, i) =>
        `Product ${i + 1}: ${p.title}\nPrice: ${p.price}\nRating: ${p.rating}\nTop Reviews:\n${(p.reviews || [])
          .slice(0, 3)
          .join("\n")}`
    )
    .join("\n\n");

  const prompt = `
Compare the following products and write a concise insight panel.
Use 2–3 sentences summarizing key trade-offs, followed by a single clear recommendation line.
Tone: helpful, neutral, consumer-friendly.

${context}
`;

  try {
    if (chrome?.ai?.prompt) {
      const session = await chrome.ai.prompt.create();
      const res = await session.prompt(prompt);
      return res?.output?.trim() || res?.text?.trim() || "";
    }
    return ""; // fallback if AI not available
  } catch (e) {
    console.error("Smart compare failed", e);
    return "";
  }
}

// ---------- MAIN UI LOGIC ----------
document.addEventListener("DOMContentLoaded", () => {
  const refreshBtn = document.getElementById("refreshBtn");
  const clearBtn = document.getElementById("clearBtn");
  const statusEl = document.getElementById("status");
  const contentEl = document.getElementById("content");

  refreshBtn.addEventListener("click", scanAndRender);
  clearBtn.addEventListener("click", clearProducts);

  // Automatically scan open tabs when popup opens
  scanAndRender();

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
        "No products found. Open product pages (Amazon/Flipkart) and re-open this popup."
      );
    });
  }

  // ---------------- Product rendering ----------------
  async function renderTable(products) {
    if (!products || !products.length) {
      renderNoProducts(
        "No products found. Open product pages (Amazon/Flipkart) and re-open this popup."
      );
      return;
    }

    contentEl.innerHTML = "";

    // --- Smart Compare Section ---
    if (products.length >= 2) {
      const compareBox = document.createElement("div");
      compareBox.className = "smart-compare";
      compareBox.innerText = "Analyzing product comparison...";
      contentEl.appendChild(compareBox);

      const summary = await generateSmartCompare(products);
      if (summary) {
        compareBox.innerHTML = `<strong>Smart Compare:</strong><br>${summary}`;
      } else {
        compareBox.style.display = "none";
      }
    }

    // --- Product Cards Grid ---
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

    contentEl.appendChild(grid);

    // summarize each product
    products.forEach(async (p, idx) => {
      const el = document.getElementById(`summary-${idx}`);
      try {
        const summary = await summarizeReviews(p.reviews || [], p.title);
        const html =
          (summary || "")
            .replace(/\*\*Pros:\*\*/g, "<strong>Pros:</strong><ul>")
            .replace(/\*\*Cons:\*\*/g, "</ul><strong>Cons:</strong><ul>")
            .replace(/- /g, "<li>") + "</ul>";
        el.innerHTML =
          html === "<ul></ul>"
            ? "No detailed reviews available for analysis."
            : html;
      } catch (err) {
        console.error("Summary failed:", err);
        el.innerText = "[summary failed]";
      }
    });
  }

  // ---------------- Sorting ----------------
  function relativeSort(products) {
    const withPrice = products.filter((p) => parsePrice(p.price) !== null);
    const without = products.filter((p) => parsePrice(p.price) === null);
    withPrice.sort(
      (a, b) => (parsePrice(a.price) || 1e12) - (parsePrice(b.price) || 1e12)
    );
    return withPrice.concat(without);
  }

  // ---------------- Scan + Render Flow ----------------
  function scanAndRender() {
    setStatus("Scanning open tabs...");
    chrome.runtime.sendMessage({ type: "scan-tabs" }, async (resp) => {
      const products = resp?.products || [];
      if (!products.length) {
        // fallback to cached
        chrome.runtime.sendMessage({ type: "get-all-products" }, (r2) => {
          const fallback = r2?.products || [];
          processAndRender(fallback);
        });
        return;
      }
      processAndRender(products);
    });
  }

  function processAndRender(products) {
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
    renderTable(sorted);
    setStatus(`${sorted.length} product(s) found`);
  }
});
