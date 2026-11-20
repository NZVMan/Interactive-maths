// Interaction tests: practice sets, symbol keys, choices, progress saving, jump links, no sideways scroll.
const { chromium } = require("/opt/npm-tools/node_modules/playwright");
const path = require("path");
const root = path.resolve(__dirname, "..");
const url = (p) => "file://" + path.join(root, p);
let failed = 0;
const ok = (cond, msg) => { if (!cond) { failed++; console.log("FAIL", msg); } else console.log("ok  ", msg); };

(async () => {
  const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));

  await page.goto(url("number/lesson-1-types-of-numbers.html"));
  ok((await page.locator("nav.toc a").count()) >= 4, "jump links ('On this page') are built");

  // 1. yes/no choice buttons: finish a whole set
  const prime = page.locator('[data-practice="isprime"]');
  for (let i = 0; i < 5; i++) {
    const n = await prime.locator(".p-q strong").innerText();
    const isP = await page.evaluate((n) => M.isPrime(+n), n);
    await prime.locator(".choice", { hasText: isP ? "yes" : "no" }).first().click();
    await prime.locator(".p-next").click();
  }
  ok(await prime.locator(".p-result").isVisible(), "set of 5 ends with a result");
  ok((await prime.locator(".p-result").innerText()).includes("5"), "result reports score out of 5");
  ok(await prime.locator(".p-done").isVisible(), "'Completed' tag shown");

  // 2. symbol keys insert at the cursor; two wrong attempts offer the answer
  const fac = page.locator('[data-practice="factorise"]');
  await fac.locator(".p-in").fill("2");
  await fac.locator(".key-btn", { hasText: "^" }).click();
  ok((await fac.locator(".p-in").inputValue()) === "2^", "symbol key inserts text");
  await fac.locator(".p-in").fill("zzz"); await fac.locator(".p-check").click();
  ok(!(await fac.locator(".p-show").isVisible()), "answer not offered after first wrong try");
  await fac.locator(".p-check").click();
  ok(await fac.locator(".p-show").isVisible(), "answer offered after second wrong try");
  await fac.locator(".p-show").click();
  ok(await fac.locator(".p-next").isVisible(), "Next appears after showing the answer");

  // 3. progress is saved and shown on the topic page
  await page.goto(url("number/index.html"));
  const txt = await page.locator('a[data-lesson="lesson-1-types-of-numbers.html"] .prog').innerText();
  ok(/1 of 3 sets done/.test(txt), "topic page shows saved progress (" + txt + ")");

  // 4. no sideways scrolling on phone width
  for (const p of ["index.html", "course/index.html", "number/index.html", "number/lesson-1-types-of-numbers.html", "number/lesson-2-indices-standard-form.html", "number/lesson-3-fractions-decimals-percentages.html", "algebra/index.html"]) {
    await page.goto(url(p));
    const w = await page.evaluate(() => document.documentElement.scrollWidth);
    ok(w <= 390, "no sideways scroll: " + p + " (" + w + ")");
  }
  ok(errs.length === 0, "no page errors " + errs.join("; "));
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
