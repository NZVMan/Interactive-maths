(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const R = M.rnd, P = M.pick;
  const near = (x, y) => Math.abs(x - y) <= 0.0051;
  const num = (s) => M.parseNumber(String(s).replace(/[\s$]/g, ""));
  const clean = (x) => M.fmtNum(parseFloat(Number(x).toFixed(8)));
  const money = (x) => "$" + M.roundDP(x, 2).toFixed(2);
  const say = (el, lines) => { el.textContent = ""; lines.forEach((l) => { const d = document.createElement("div"); d.textContent = l; el.appendChild(d); }); };

  function fxUI() {
    const out = $("fx-out"), a = parseFloat($("fx-a").value.replace(/,/g, "")), r = parseFloat($("fx-r").value);
    if (!(a > 0) || !(r > 0)) return say(out, ["Type a positive amount and rate."]);
    if ($("fx-d").value === "to") say(out, ["NZD to other: multiply.", clean(a) + " × " + clean(r) + " = " + clean(M.roundDP(a * r, 2))]);
    else say(out, ["Other to NZD: divide.", clean(a) + " ÷ " + clean(r) + " = " + clean(M.roundDP(a / r, 2)) + " NZD"]);
  }
  ["fx-a", "fx-r", "fx-d"].forEach((id) => $(id).addEventListener("input", fxUI));

  function diUI() {
    const out = $("di-out"), p = parseFloat($("di-p").value), r = parseFloat($("di-r").value);
    if (!(p > 0) || !(r >= 0)) return say(out, ["Type a positive price and a percentage."]);
    const off = $("di-m").value === "off", f = off ? 1 - r / 100 : 1 + r / 100;
    say(out, [(off ? "Discount" : "Increase") + ": " + clean(r) + "% of " + clean(p) + " = " + money(p * r / 100),
      "Multiplier: " + clean(M.roundDP(f, 6)) + ".  " + clean(p) + " × " + clean(M.roundDP(f, 6)) + " = " + money(p * f)]);
  }
  ["di-p", "di-r", "di-m"].forEach((id) => $(id).addEventListener("input", diUI));

  function plUI() {
    const out = $("pl-out"), c = parseFloat($("pl-c").value), s = parseFloat($("pl-s").value);
    if (!(c > 0) || !(s >= 0)) return say(out, ["Type a cost and a selling price."]);
    const d = s - c, pct = d / c * 100;
    say(out, [d >= 0 ? "Profit = " + clean(s) + " − " + clean(c) + " = " + money(d) : "Loss = " + clean(c) + " − " + clean(s) + " = " + money(-d),
      (d >= 0 ? "Percentage profit" : "Percentage loss") + " = " + money(Math.abs(d)).slice(1) + " ÷ " + clean(c) + " × 100 = " + clean(M.roundDP(Math.abs(pct), 2)) + "%"]);
  }
  ["pl-c", "pl-s"].forEach((id) => $(id).addEventListener("input", plUI));

  function inUI() {
    const out = $("in-out"), tab = $("in-tab"), p = parseFloat($("in-p").value), r = parseFloat($("in-r").value), n = parseInt($("in-n").value, 10);
    tab.textContent = "";
    if (!(p > 0) || !(r >= 0) || !(n >= 1 && n <= 10)) return say(out, ["Use a positive amount and rate, and 1 to 10 years."]);
    const head = tab.createTHead().insertRow();
    ["Year", "Simple balance", "Compound balance"].forEach((h) => { const th = document.createElement("th"); th.textContent = h; head.appendChild(th); });
    const body = tab.createTBody();
    for (let y = 1; y <= n; y++) {
      const row = body.insertRow();
      [y, money(p + p * r * y / 100), money(p * Math.pow(1 + r / 100, y))].forEach((t) => { row.insertCell().textContent = String(t); });
    }
    const A = p * Math.pow(1 + r / 100, n);
    say(out, ["Simple: I = " + clean(p) + " × " + clean(r) + " × " + n + " ÷ 100 = " + money(p * r * n / 100),
      "Compound: A = " + clean(p) + " × (1 + " + clean(r) + "/100)" + M.sup(n) + " = " + money(A) + ", so interest = " + money(A - p)]);
  }
  ["in-p", "in-r", "in-n"].forEach((id) => $(id).addEventListener("input", inUI));

  /* ---- Practice ---- */
  M.registerPractice("currency", () => {
    const cur = P([["AUD", 0.92], ["USD", 0.6], ["GBP", 0.45], ["EUR", 0.55], ["FJD", 1.3], ["JPY", 90]]);
    const c = cur[0], r = cur[1], to = Math.random() < 0.5;
    if (to) {
      const a = P([50, 80, 120, 250, 400, 750, 1200]), ans = M.roundDP(a * r, 2);
      return { q: "The exchange rate is <span class=\"m\">1 NZD = " + clean(r) + " " + c + "</span>. Convert $" + a + " NZD to " + c + ".", placeholder: "e.g. 55.50",
        check: (s) => near(num(s), ans), explain: a + " × " + clean(r) + " = " + clean(ans) + " " + c + ".", hint: "Going from NZD to another currency: multiply by the rate." };
    }
    const k = R(2, 40) * P([5, 10]), f = M.roundDP(k * r, 2), ans = M.roundDP(f / r, 2);
    return { q: "The exchange rate is <span class=\"m\">1 NZD = " + clean(r) + " " + c + "</span>. How many NZD is " + clean(f) + " " + c + " worth? (to the nearest cent)", placeholder: "e.g. 87.50",
      check: (s) => near(num(s), ans), explain: clean(f) + " ÷ " + clean(r) + " = " + clean(ans) + " NZD.", hint: "Going back to NZD: divide by the rate." };
  });
  M.registerPractice("discount", () => {
    const kind = R(0, 2), p = P([40, 60, 85, 120, 150, 240, 320, 55, 95]);
    if (kind === 0) {
      const d = P([10, 15, 20, 25, 30, 40]), ans = M.roundDP(p * (1 - d / 100), 2);
      return { q: "A pair of shoes costs $" + p + ". The sale gives " + d + "% off. What is the sale price in dollars?", placeholder: "e.g. 68",
        check: (s) => near(num(s), ans), explain: d + "% of " + p + " = " + clean(p * d / 100) + ". " + p + " − " + clean(p * d / 100) + " = " + clean(ans) + ".", hint: "Find the discount, then subtract it. Or multiply by " + clean(1 - d / 100) + "." };
    }
    if (kind === 1) {
      const ans = M.roundDP(p * 1.15, 2);
      return { q: "A tool costs $" + p + " before GST. GST is 15%. What is the price including GST, in dollars?", placeholder: "e.g. 69",
        check: (s) => near(num(s), ans), explain: p + " × 1.15 = " + clean(ans) + ".", hint: "Adding 15% is the same as multiplying by 1.15." };
    }
    const w = P([30, 50, 70, 90]), d = P([10, 20, 25, 40]), pr = P([40, 80, 120, 200]), ans = M.roundDP(pr * (1 - d / 100) * 1, 2);
    return { q: "A bag is marked $" + pr + ". It is " + d + "% off today. How many dollars do you save?", placeholder: "e.g. 20",
      check: (s) => near(num(s), pr * d / 100), explain: d + "% of " + pr + " = " + clean(pr * d / 100) + ". You save $" + clean(pr * d / 100) + ".", hint: "Find the percentage of the marked price." };
  });
  M.registerPractice("profit", () => {
    const c = P([20, 40, 50, 80, 120, 200, 250]), pct = P([10, 20, 25, 30, 40, 50, 60]), loss = Math.random() < 0.4;
    const s = c * (loss ? 1 - pct / 100 : 1 + pct / 100), v = Math.abs(s - c);
    if (Math.random() < 0.5) return { q: "A shop buys a bike for $" + c + " and sells it for $" + clean(s) + ". What is the " + (loss ? "percentage loss" : "percentage profit") + "? (Type the number only.)", placeholder: "e.g. 25",
      check: (x) => Math.abs(num(x) - pct) < 0.01, explain: (loss ? "Loss" : "Profit") + " = " + clean(v) + ". " + clean(v) + " ÷ " + c + " × 100 = " + pct + "%.", hint: "Percentage = " + (loss ? "loss" : "profit") + " ÷ cost price × 100." };
    return { q: "A trader buys goods for $" + c + " and sells them at a " + pct + "% " + (loss ? "loss" : "profit") + ". What is the selling price, in dollars?", placeholder: "e.g. 150",
      check: (x) => near(num(x), s), explain: pct + "% of " + c + " = " + clean(v) + ". " + c + (loss ? " − " : " + ") + clean(v) + " = " + clean(s) + ".", hint: "Find the percentage of the cost price, then " + (loss ? "subtract" : "add") + " it." };
  });
  M.registerPractice("simple", () => {
    const p = P([500, 800, 1200, 2000, 3500, 5000]), r = P([2, 3, 4, 5, 6]), t = R(2, 6), I = p * r * t / 100;
    if (Math.random() < 0.5) return { q: "Find the simple interest on $" + p + " invested at " + r + "% per year for " + t + " years, in dollars.", placeholder: "e.g. 240",
      check: (s) => near(num(s), I), explain: "I = " + p + " × " + r + " × " + t + " ÷ 100 = " + clean(I) + ".", hint: "I = P × R × T ÷ 100" };
    return { q: "$" + p + " is invested at " + r + "% simple interest for " + t + " years. How much is it worth at the end, in dollars?", placeholder: "e.g. 1440",
      check: (s) => near(num(s), p + I), explain: "I = " + p + " × " + r + " × " + t + " ÷ 100 = " + clean(I) + ". " + p + " + " + clean(I) + " = " + clean(p + I) + ".", hint: "Work out the interest, then add it to the amount invested." };
  });
  M.registerPractice("compound", () => {
    const p = P([500, 800, 1000, 2000, 3000, 5000]), r = P([2, 3, 4, 5, 6]), n = R(2, 4), A = M.roundDP(p * Math.pow(1 + r / 100, n), 2);
    if (Math.random() < 0.6) return { q: "$" + p + " is invested at " + r + "% compound interest per year for " + n + " years. How much is it worth at the end, to the nearest cent?", keys: [], placeholder: "e.g. 1102.50",
      check: (s) => near(num(s), A), explain: "A = " + p + " × (1 + " + r + "/100)" + M.sup(n) + " = " + p + " × " + clean(M.roundDP(1 + r / 100, 4)) + M.sup(n) + " = " + clean(A) + ".", hint: "A = P(1 + R/100)ⁿ. Type 1 + R/100 as a decimal, use the power key, and multiply by P." };
    return { q: "$" + p + " is invested at " + r + "% compound interest per year for " + n + " years. How much interest is earned, to the nearest cent?", placeholder: "e.g. 102.50",
      check: (s) => near(num(s), M.roundDP(A - p, 2)), explain: "A = " + p + " × " + clean(M.roundDP(1 + r / 100, 4)) + M.sup(n) + " = " + clean(A) + ". Interest = " + clean(A) + " − " + p + " = " + clean(M.roundDP(A - p, 2)) + ".", hint: "Find the final amount with A = P(1 + R/100)ⁿ, then subtract the amount you started with." };
  });
  M.registerPractice("earnings", () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"], h = days.map(() => P([6, 7, 8, 8, 8, 9, 10])), rate = P([22, 24, 26.5, 30]);
    const normal = h.reduce((a, x) => a + Math.min(x, 8), 0), ot = h.reduce((a, x) => a + Math.max(x - 8, 0), 0);
    const pay = normal * rate + ot * rate * 1.5;
    const rows = "<tr>" + days.map((d) => "<th>" + d + "</th>").join("") + "</tr><tr>" + h.map((x) => "<td>" + x + "</td>").join("") + "</tr>";
    return { q: "Sam's hours this week are in the table. The normal rate is $" + clean(rate) + " per hour for up to 8 hours a day. Hours over 8 in a day are paid at 1.5 times the normal rate. How much does Sam earn, in dollars?<div class=\"tablewrap\"><table class=\"compact\">" + rows + "</table></div>", placeholder: "e.g. 1024.50",
      check: (s) => near(num(s), pay),
      explain: "Normal hours " + normal + " × " + clean(rate) + " = " + clean(normal * rate) + ". Overtime " + clean(ot) + " × " + clean(rate * 1.5) + " = " + clean(ot * rate * 1.5) + ". Total = " + clean(pay) + ".",
      hint: "Count normal hours (up to 8 each day) and overtime hours (the part over 8) separately. Overtime rate = 1.5 × " + clean(rate) + "." };
  });

  fxUI(); diUI(); plUI(); inUI();
  M.mountAll();
})();
