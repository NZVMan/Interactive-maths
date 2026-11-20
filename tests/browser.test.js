// Loads every page in headless Chrome, fails on console/page errors, and sanity-checks practice generators.
const { chromium } = require("/opt/npm-tools/node_modules/playwright");
const path = require("path");
const root = path.resolve(__dirname, "..");
const fs = require("fs");
const extra = ["course", "algebra", "coordinate-geometry", "graphs", "geometry", "mensuration", "trigonometry", "probability", "statistics", "vectors", "transformations"].map((d) => d + "/index.html");
const pages = extra.concat(["index.html", "number/index.html"].concat(fs.readdirSync(path.join(__dirname,"..","number")).filter((f)=>/^lesson-\d+-.*\.html$/.test(f)).map((f)=>"number/"+f)));

(async () => {
  const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  let failed = 0;
  for (const p of pages) {
    const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
    const errs = [];
    page.on("pageerror", (e) => errs.push("pageerror: " + e.message));
    page.on("console", (m) => { if (m.type() === "error") errs.push("console: " + m.text()); });
    await page.goto("file://" + path.join(root, p));
    await page.waitForTimeout(200);

    const result = await page.evaluate(() => {
      if (typeof M === "undefined") return { problems: [] };
      const problems = [];
      const candidates = (explain) => {
        const text = explain.replace(/<[^>]+>/g, "");
        const out = new Set();
        text.split("=").forEach((seg) => { out.add(seg.replace(/\.\s*$/, "").trim()); out.add(seg.replace(/\.\s*$/, "").trim().split(/\s{2,}|,|\. /)[0]); });
        (text.match(/[−-]?\d+(?:\.\d+)?(?:\/\d+)?/g) || []).forEach((n) => out.add(n));
        (text.match(/\d+(?:\.\d+)?\s*×\s*10[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g) || []).forEach((n) => out.add(n));
        if (/less than/.test(text)) out.add("<"); if (/greater than/.test(text)) out.add(">"); if (/equal to/.test(text)) out.add("=");
        if (/not sensible/i.test(text)) out.add("Not sensible"); else if (/sensible/i.test(text)) out.add("Sensible");
        out.add(text.includes("not") ? "no" : "yes"); out.add("yes"); out.add("no");
        return Array.from(out).filter(Boolean);
      };
      Object.keys(M._generators).forEach((name) => {
        for (let i = 0; i < 300; i++) {
          let g;
          try { g = M._generators[name](); } catch (e) { problems.push(name + " threw " + e.message); break; }
          if (!g.q || /NaN|undefined|Infinity/.test(g.q + (g.explain || ""))) { problems.push(name + " bad text: " + g.q + " | " + g.explain); continue; }
          if (g.check("zzz qqq")) problems.push(name + " accepted junk: " + g.q);
          if (!candidates(g.explain).some((c) => { try { return g.check(c); } catch (e) { return false; } })) problems.push(name + " no candidate accepted: " + g.q.replace(/<[^>]+>/g, "") + " || " + g.explain);
        }
      });
      return { problems: Array.from(new Set(problems)).slice(0, 12), gens: Object.keys(M._generators) };
    });
    if (errs.length || result.problems.length) { failed++; console.log("FAIL", p, errs, result.problems); }
    else console.log("ok  ", p, result.gens ? "(generators: " + result.gens.join(", ") + ")" : "");
    await page.close();
  }
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
