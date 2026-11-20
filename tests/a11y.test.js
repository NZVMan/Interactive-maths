// Device-size, tap-target, labelling and keyboard checks. Emulated in Chrome (not a substitute for real devices or a screen reader).
const { chromium, devices } = require("/opt/npm-tools/node_modules/playwright");
const path = require("path");
const fs = require("fs");
const root = path.resolve(__dirname, "..");
const url = (p) => "file://" + path.join(root, p);
const lessons = require("./pages.js")();
const pages = ["index.html", "course/index.html", "number/index.html", "algebra/index.html"].concat(lessons);
let failed = 0;
const ok = (c, m) => { if (!c) { failed++; console.log("FAIL", m); } else console.log("ok  ", m); };

(async () => {
  const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });

  // 1. Device sizes: no sideways scroll
  const sizes = { "iPhone SE (320)": { width: 320, height: 568 }, "iPhone 14 (390)": { width: 390, height: 844 }, "Pixel 7 (412)": { width: 412, height: 915 }, "iPad (768)": { width: 768, height: 1024 }, "Laptop (1280)": { width: 1280, height: 800 } };
  for (const [name, vp] of Object.entries(sizes)) {
    const ctx = await browser.newContext({ viewport: vp, hasTouch: vp.width < 800, isMobile: vp.width < 800 });
    let bad = [];
    for (const p of pages) {
      const page = await ctx.newPage(); await page.goto(url(p));
      const w = await page.evaluate(() => document.documentElement.scrollWidth);
      if (w > vp.width) bad.push(p + " (" + w + ")");
      await page.close();
    }
    ok(bad.length === 0, "no sideways scroll at " + name + (bad.length ? ": " + bad.join(", ") : ""));
    await ctx.close();
  }

  // 2. Structure, labels, tap targets (phone)
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  for (const p of pages) {
    const page = await ctx.newPage(); await page.goto(url(p));
    const r = await page.evaluate(() => {
      const out = [];
      const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !e.closest("[hidden]"); };
      if (document.documentElement.lang !== "en-NZ") out.push("html lang is not en-NZ");
      if (!document.title.trim()) out.push("missing <title>");
      if (document.querySelectorAll("h1").length !== 1) out.push("expected exactly one h1, found " + document.querySelectorAll("h1").length);
      if (!document.querySelector("main#main")) out.push("no main#main landmark");
      let last = 1;
      document.querySelectorAll("h1,h2,h3,h4").forEach((h) => { const l = +h.tagName[1]; if (l > last + 1) out.push("heading level jumps to " + h.tagName + ': "' + h.textContent.trim().slice(0, 30) + '"'); last = l; });
      document.querySelectorAll("input,select,textarea").forEach((i) => {
        if (!vis(i)) return;
        const named = i.getAttribute("aria-label") || (i.id && document.querySelector('label[for="' + i.id + '"]')) || i.closest("label");
        if (!named) out.push("unlabelled field: " + (i.id || i.className));
        if (i.type !== "range" && i.type !== "checkbox" && parseFloat(getComputedStyle(i).fontSize) < 16) out.push("field font under 16px (iOS zooms the page): " + (i.id || i.className));
      });
      document.querySelectorAll("button").forEach((b) => { if (vis(b) && !(b.textContent.trim() || b.getAttribute("aria-label"))) out.push("button without a name"); });
      document.querySelectorAll("button,input,select,.btn,.key-btn,.l,.start").forEach((e) => {
        if (!vis(e)) return;
        const r = (e.type === "checkbox" && e.closest("label") ? e.closest("label") : e).getBoundingClientRect();
        if (e.type === "range") return;
        if (r.height < 40) out.push("small tap target (" + Math.round(r.height) + "px): " + (e.id || e.className || e.tagName));
      });
      document.querySelectorAll("svg[role=img]").forEach((s) => { if (!s.getAttribute("aria-label")) out.push("svg image without label"); });
      return out;
    });
    ok(r.length === 0, "structure, labels and tap targets: " + p + (r.length ? " -> " + Array.from(new Set(r)).join("; ") : ""));
    await page.close();
  }

  // 3. Keyboard: every focusable thing shows a visible focus indicator
  for (const p of ["number/lesson-3-fractions-decimals-percentages.html", "number/index.html", "index.html"]) {
    const page = await (await browser.newContext({ viewport: { width: 1000, height: 800 } })).newPage();
    await page.goto(url(p));
    const bad = [], seen = new Set();
    for (let i = 0; i < 120; i++) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const e = document.activeElement; if (!e || e === document.body || e.dataset.seen) return null;
        e.dataset.seen = "1";
        const cs = getComputedStyle(e);
        return { id: e.id || e.className || e.tagName, shown: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0, text: (e.textContent || e.value || "").trim().slice(0, 20) };
      });
      if (!info) break;
      seen.add(i);
      if (!info.shown) bad.push(info.id + " \"" + info.text + "\"");
    }
    ok(seen.size > 3 && bad.length === 0, "keyboard focus visible on every stop: " + p + " (" + seen.size + " stops)" + (bad.length ? " -> " + bad.join(", ") : ""));
    await page.context().close();
  }

  // 4. A whole practice set can be done from the keyboard
  {
    const page = await (await browser.newContext({ viewport: { width: 1000, height: 800 } })).newPage();
    await page.goto(url("number/lesson-3-fractions-decimals-percentages.html"));
    const box = page.locator('[data-practice="pcof"]');
    for (let i = 0; i < 5; i++) {
      const t = await box.locator(".p-q").innerText();
      const m = t.match(/(\d+)%.*?of\s+(\d+)/s);
      await box.locator(".p-in").focus();
      await page.keyboard.type(String((+m[1] / 100) * +m[2]));
      await page.keyboard.press("Enter");   // check
      await page.keyboard.press("Enter");   // next (focus moved to the Next button)
    }
    ok(await box.locator(".p-result").isVisible(), "practice set can be completed with the keyboard only");
    await page.context().close();
  }
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
