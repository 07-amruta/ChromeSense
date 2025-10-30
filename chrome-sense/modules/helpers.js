// modules/helpers.js

function parsePrice(priceStr) {
  if (!priceStr) return null;
  // remove currency symbols and non-digit except dot
  const cleaned = priceStr.replace(/[^0-9.,]/g, '').replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function similarTitle(a = '', b = '') {
  a = a.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  b = b.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  if (!a || !b) return 0;
  const as = new Set(a.split(' ').filter(Boolean));
  const bs = b.split(' ').filter(Boolean);
  let common = 0;
  for (const t of bs) if (as.has(t)) common++;
  const score = common / Math.max(1, Math.min(as.size, bs.length));
  return score;
}

export { parsePrice, similarTitle };
