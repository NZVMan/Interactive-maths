(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const say = (el, lines) => { el.textContent = ""; lines.forEach((l) => { const d = document.createElement("div"); d.textContent = l; el.appendChild(d); }); };
  const near = (x, y) => Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(y));
  const round2 = (x) => parseFloat(x.toFixed(2));
  const fmt = (x) => M.fmtNum(round2(x));

  /* ---- 1. Fraction explorer ---- */
  function fracUI() {
    let n = parseInt($("fn").value, 10), d = parseInt($("fd").value, 10);
    if (!(d >= 1 && d <= 40) || !(n >= 0 && n <= 40)) return say($("f-out"), ["Use a numerator from 0 to 40 and a denominator from 1 to 40."]);
    const val = n / d;
    const bar = $("f-bar"); bar.textContent = "";
    const cells = Math.min(d, 40);
    const filled = Math.min(n, d);
    for (let i = 0; i < cells; i++) { const c = document.createElement("i"); if (i < filled) c.className = "on"; bar.appendChild(c); }
    const grid = $("f-grid"); grid.textContent = "";
    const on = Math.round(Math.min(val, 1) * 100);
    for (let i = 0; i < 100; i++) { const c = document.createElement("i"); if (i < on) c.className = "on"; grid.appendChild(c); }
    const [sn, sd] = M.simplify(n, d);
    const dec = M.toDecimal(n, d);
    const pct = val * 100;
    const lines = [
      "Fraction: " + n + "/" + d + (sn !== n ? " = " + sn + "/" + sd + " (simplest form)" : ""),
      "Decimal: " + dec.text + (dec.recurring ? "  (the bracketed digits repeat)" : ""),
      "Percentage: " + (Number.isInteger(pct * 100) || Math.abs(pct - round2(pct)) < 1e-9 ? M.fmtNum(round2(pct)) + "%" : "≈ " + M.fmtNum(round2(pct)) + "%")
    ];
    if (val > 1) lines.push("This is more than 1, so the grid shows one whole.");
    say($("f-out"), lines);
  }
  ["fn", "fd"].forEach((id) => $(id).addEventListener("input", fracUI));

  /* ---- 2. Converter ---- */
  function parseAny(s) {
    s = s.trim().replace(/\s+/g, "").replace(/−/g, "-");
    let m;
    if ((m = /^(-?\d+)\/(\d+)$/.exec(s))) { const d = parseInt(m[2], 10); return d ? M.simplify(parseInt(m[1], 10), d) : null; }
    if ((m = /^(-?\d*\.?\d+)%$/.exec(s))) { const f = M.decimalToFraction(m[1]); return f ? M.simplify(f[0], f[1] * 100) : null; }
    if (/^-?\d*\.?\d+$/.test(s)) return M.decimalToFraction(s);
    return null;
  }
  function convUI() {
    const f = parseAny($("cv-in").value);
    if (!f) return say($("cv-out"), ["Try something like 3/8, 0.35 or 35%."]);
    const [n, d] = f, dec = M.toDecimal(n, d), pct = (n / d) * 100;
    say($("cv-out"), [
      "Fraction: " + n + "/" + d,
      "Decimal: " + dec.text + (dec.recurring ? "  (repeating digits in brackets)" : ""),
      "Percentage: " + (dec.recurring ? "≈ " : "") + M.fmtNum(round2(pct)) + "%"
    ]);
  }
  $("cv-go").addEventListener("click", convUI);
  $("cv-in").addEventListener("keydown", (e) => { if (e.key === "Enter") convUI(); });

  /* ---- 4. Percentage calculator ---- */
  const MODES = {
    of: [["pa", "Percentage", 25], ["pb", "Quantity", 240]],
    as: [["pa", "Part", 18], ["pb", "Whole", 72]],
    chg: [["pa", "Original", 80], ["pb", "New value", 92]]
  };
  function fields() {
    const box = $("pm-fields"); box.textContent = "";
    MODES[$("pm").value].forEach(([id, label, val]) => {
      const l = document.createElement("label"); l.htmlFor = id; l.textContent = label;
      const i = document.createElement("input"); i.type = "number"; i.id = id; i.value = val; i.step = "any"; i.style.width = "7em";
      i.addEventListener("input", pmUI);
      box.appendChild(l); box.appendChild(i);
    });
    pmUI();
  }
  function pmUI() {
    const mode = $("pm").value, a = parseFloat($("pa").value), b = parseFloat($("pb").value), out = $("pm-out");
    if (!isFinite(a) || !isFinite(b)) return say(out, ["Fill in both boxes."]);
    if (mode === "of") {
      say(out, [a + "% of " + b + " = " + a + "/100 × " + b + " = " + fmt(a / 100 * b), "Or: " + a + "% = " + M.fmtNum(a / 100) + ", and " + M.fmtNum(a / 100) + " × " + b + " = " + fmt(a / 100 * b)]);
    } else if (mode === "as") {
      if (b === 0) return say(out, ["The whole can't be 0."]);
      say(out, [a + " as a percentage of " + b + " = " + a + "/" + b + " × 100 = " + fmt(a / b * 100) + "%"]);
    } else {
      if (a === 0) return say(out, ["The original can't be 0."]);
      const ch = b - a, p = ch / a * 100;
      say(out, ["Change = " + b + " − " + a + " = " + M.fmtNum(round2(ch)),
        "Percentage " + (ch >= 0 ? "increase" : "decrease") + " = " + M.fmtNum(round2(Math.abs(ch))) + "/" + a + " × 100 = " + fmt(Math.abs(p)) + "%",
        "Multiplier: " + M.fmtNum(parseFloat((b / a).toFixed(4)))]);
    }
  }
  $("pm").addEventListener("change", fields);

  /* ---- Practice ---- */
  const num = (s) => M.parseNumber(String(s).replace(/\s+/g, "").replace(/[$]/g, ""));

  M.registerPractice("fdp", () => {
    const bank = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 8], [5, 8], [7, 20], [9, 25], [3, 10], [11, 40], [13, 50]];
    const [n, d] = M.pick(bank);
    const kind = M.rnd(0, 2);
    if (kind === 0) return { q: "Write <span class=\"m\">" + n + "/" + d + "</span> as a decimal.", check: (s) => near(num(s), n / d),
      explain: n + " ÷ " + d + " = " + M.fmtNum(n / d) + ".", hint: "Divide the numerator by the denominator." };
    if (kind === 1) return { q: "Write <span class=\"m\">" + n + "/" + d + "</span> as a percentage. (Just the number is fine.)", check: (s) => near(num(s), n / d * 100),
      explain: n + "/" + d + " = " + M.fmtNum(n / d) + " = " + M.fmtNum(parseFloat((n / d * 100).toFixed(6))) + "%.", hint: "Turn it into a decimal first, then multiply by 100." };
    const p = parseFloat((n / d * 100).toFixed(6));
    return { q: "Write <strong>" + M.fmtNum(p) + "%</strong> as a fraction in its simplest form.",
      check: (s) => { const m = /^\s*(\d+)\s*\/\s*(\d+)\s*$/.exec(s); if (!m) return false; const a = +m[1], b = +m[2]; return b !== 0 && a === n && b === d; },
      explain: M.fmtNum(p) + "% = " + n + "/" + d + ".", hint: "Write it over 100, then divide top and bottom by their HCF. Type the answer like 7/20." };
  });
  M.registerPractice("compare", () => {
    let d, n;
    do { d = M.pick([4, 5, 8, 10, 20]); n = M.rnd(1, d - 1); } while (M.gcd(n, d) !== 1);
    const dec = parseFloat((M.rnd(5, 95) / 100).toFixed(2));
    const left = n / d;
    const sym = near(left, dec) ? "=" : left > dec ? ">" : "<";
    return {
      q: "Which symbol goes in the gap?  <span class=\"m\">" + n + "/" + d + "  ___  " + M.fmtNum(dec) + "</span>  (type &lt;, &gt; or =)",
      check: (s) => s.trim() === sym,
      explain: n + "/" + d + " = " + M.fmtNum(left) + ", which is " + (sym === "=" ? "equal to " : sym === ">" ? "greater than " : "less than ") + M.fmtNum(dec) + ".",
      hint: "Change the fraction to a decimal, then compare."
    };
  });
  M.registerPractice("pcof", () => {
    const p = M.pick([5, 10, 12, 15, 20, 25, 30, 35, 40, 60, 75]);
    const q = M.pick([40, 60, 80, 120, 150, 200, 240, 360, 500]);
    const ans = p / 100 * q;
    return { q: "Find <strong>" + p + "%</strong> of <strong>" + q + "</strong>.", check: (s) => near(num(s), ans),
      explain: p + "/100 × " + q + " = " + M.fmtNum(ans) + ".", hint: "Divide by 100 to find 1%, then multiply by " + p + ". Or multiply by " + M.fmtNum(p / 100) + "." };
  });
  M.registerPractice("pcchange", () => {
    const orig = M.pick([40, 50, 60, 80, 120, 200, 250, 400]);
    const p = M.pick([5, 10, 15, 20, 25, 30, 40]);
    const up = Math.random() < 0.5;
    const nv = orig * (1 + (up ? p : -p) / 100);
    if (Math.random() < 0.5) {
      return { q: "A price of <strong>$" + orig + "</strong> " + (up ? "increases" : "decreases") + " by <strong>" + p + "%</strong>. What is the new price? (in dollars)",
        check: (s) => near(num(s), nv),
        explain: "Multiplier " + M.fmtNum(1 + (up ? p : -p) / 100) + ", so " + orig + " × " + M.fmtNum(1 + (up ? p : -p) / 100) + " = $" + M.fmtNum(nv) + ".",
        hint: "Use a multiplier: " + (up ? "100% + " : "100% − ") + p + "% = " + (100 + (up ? p : -p)) + "%, which is " + M.fmtNum(1 + (up ? p : -p) / 100) + "." };
    }
    return { q: "A price changes from <strong>$" + orig + "</strong> to <strong>$" + M.fmtNum(nv) + "</strong>. What is the percentage " + (up ? "increase" : "decrease") + "? (Just the number is fine.)",
      check: (s) => near(num(s), p),
      explain: "Change = " + M.fmtNum(Math.abs(nv - orig)) + ", so " + M.fmtNum(Math.abs(nv - orig)) + "/" + orig + " × 100 = " + p + "%.",
      hint: "Percentage change = change ÷ original × 100." };
  });

  fracUI(); convUI(); fields();
  M.mountAll();
})();
