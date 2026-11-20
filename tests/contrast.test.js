// WCAG contrast check of visible text in light and dark mode. Needs Playwright and Chrome.
const { chromium } = require("/opt/npm-tools/node_modules/playwright");
const path = require("path");
const root = path.resolve(__dirname, "..");
const pages = ["index.html", "course/index.html", "algebra/index.html", "number/index.html",
  ]
  .concat(require("./pages.js")());

function inPage() {
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] }; };
  const over = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  const bgOf = (el) => {
    const stack = [];
    for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c.a > 0) { stack.push(c); if (c.a === 1) break; } }
    let base = parse(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
    if (base.a < 1) base = { r: 255, g: 255, b: 255, a: 1 };
    return stack.reverse().reduce((acc, c) => over(c, acc), base);
  };
  const bad = [];
  const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    if (!n.nodeValue.trim()) continue;
    const el = n.parentElement;
    if (!el || seen.has(el)) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || el.closest("[hidden]") || el.closest(".sr") || el.closest(".skip")) continue;
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    seen.add(el);
    let fg = parse(cs.color); if (!fg) continue;
    const bg = bgOf(el);
    fg = over({ ...fg, a: fg.a * (parseFloat(cs.opacity) || 1) }, bg);
    const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight, 10) >= 700;
    const need = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;
    const cr = ratio(fg, bg);
    if (cr < need) bad.push((el.className || el.tagName) + " \"" + n.nodeValue.trim().slice(0, 30) + "\" " + cr.toFixed(2) + " < " + need);
  }
  // placeholders
  document.querySelectorAll("input[placeholder]").forEach((i) => {
    if (i.closest("[hidden]")) return;
    const ph = parse(getComputedStyle(i, "::placeholder").color); const bg = bgOf(i);
    const own = parse(getComputedStyle(i).backgroundColor); const back = own && own.a > 0 ? own : bg;
    if (ph) { const cr = ratio(over(ph, back), back); if (cr < 4.5) bad.push("placeholder " + cr.toFixed(2)); }
  });
  // borders of form fields and symbol buttons need 3:1 against what is behind them
  document.querySelectorAll("input[type=text],input[type=number],select,.key-btn").forEach((i) => {
    if (i.closest("[hidden]") || !i.getBoundingClientRect().width) return;
    const cs = getComputedStyle(i), bc = parse(cs.borderTopColor), behind = bgOf(i.parentElement);
    if (bc && ratio(over(bc, behind), behind) < 3) bad.push("field border " + ratio(over(bc, behind), behind).toFixed(2) + " < 3 on " + (i.id || i.className));
  });
  return bad;
}

(async () => {
  const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  let failed = 0;
  for (const scheme of ["light", "dark"]) {
    const ctx = await browser.newContext({ colorScheme: scheme, viewport: { width: 390, height: 844 } });
    for (const p of pages) {
      const page = await ctx.newPage();
      await page.goto("file://" + path.join(root, p));
      // open states that start hidden/collapsed
      await page.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));
      const bad = await page.evaluate(inPage);
      if (bad.length) { failed++; console.log("FAIL", scheme, p, Array.from(new Set(bad)).slice(0, 12)); } else console.log("ok  ", scheme, p);
      await page.close();
    }
  }
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
