(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const sp = (a, n) => a + M.sup(n);
  const big = (a, n) => (BigInt(a) ** BigInt(n)).toString();

  function say(el, lines) {
    el.textContent = "";
    lines.forEach((l) => { const d = document.createElement("div"); d.textContent = l; el.appendChild(d); });
  }
  const clampInt = (id, lo, hi) => {
    const v = parseInt($(id).value, 10);
    return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo;
  };

  /* ---- Index law explorer ---- */
  function lawUI() {
    const law = $("law").value, a = clampInt("la", 2, 9), m = clampInt("lm", 0, 6);
    let n = clampInt("ln", 0, 6);
    const rep = (k) => (k === 0 ? "1" : Array(k).fill(a).join(" × "));
    const lines = [];
    if (law === "mul") {
      lines.push(sp(a, m) + " × " + sp(a, n) + " = " + sp(a, m + n));
      lines.push("(" + rep(m) + ") × (" + rep(n) + ")  has  " + m + " + " + n + " = " + (m + n) + "  copies of " + a);
      lines.push("Check: " + big(a, m) + " × " + big(a, n) + " = " + big(a, m + n));
    } else if (law === "div") {
      if (n > m) { const t = m; $("lm").value = n; $("ln").value = t; return lawUI(); }
      lines.push(sp(a, m) + " ÷ " + sp(a, n) + " = " + sp(a, m - n));
      lines.push(n + " of the " + m + " copies of " + a + " cancel, leaving " + (m - n));
      lines.push("Check: " + big(a, m) + " ÷ " + big(a, n) + " = " + big(a, m - n));
    } else {
      lines.push("(" + sp(a, m) + ")" + M.sup(n) + " = " + sp(a, m * n));
      lines.push(n + " groups of (" + m + " copies of " + a + ") = " + m + " × " + n + " = " + (m * n) + " copies");
      lines.push("Check: " + big(a, m) + " multiplied " + n + " times = " + big(a, m * n));
    }
    say($("law-out"), lines);
  }
  ["law", "la", "lm", "ln"].forEach((id) => $(id).addEventListener("input", lawUI));

  /* ---- General index calculator ---- */
  function parseIndex(s) {
    const m = /^\s*(-?\d+)\s*(?:\/\s*(\d+))?\s*$/.exec(String(s).replace(/−/g, "-"));
    if (!m) return null;
    const p = parseInt(m[1], 10), q = m[2] ? parseInt(m[2], 10) : 1;
    return q === 0 ? null : { p, q };
  }
  function indexUI() {
    const b = parseInt($("ib").value, 10), idx = parseIndex($("ii").value), out = $("i-out");
    if (!(b >= 1 && b <= 1000)) return say(out, ["Choose a whole-number base from 1 to 1000."]);
    if (!idx || Math.abs(idx.p) > 6 || idx.q > 6) return say(out, ["Type the index as a whole number like -2, or a fraction like 2/3 (up to 6)."]);
    const [p, q] = M.simplify(idx.p, idx.q);
    const lines = [];
    const label = q === 1 ? String(p) : p + "/" + q;
    lines.push("Work out " + b + "^(" + label + ")");
    if (p === 0) { lines.push("Any number to the power 0 is 1."); lines.push("Answer: 1"); return say(out, lines); }
    const k = Math.abs(p);
    let step = b + "^(" + label + ")";
    if (p < 0) {
      lines.push("Negative index → take the reciprocal: " + step + " = 1 ÷ " + b + "^(" + (q === 1 ? k : k + "/" + q) + ")");
    }
    let val;
    if (q === 1) {
      val = b ** k;
      lines.push(b + "^" + k + " = " + val);
    } else {
      const r = Math.round(Math.pow(b, 1 / q));
      const rootName = q === 2 ? "square root" : q === 3 ? "cube root" : q + "th root";
      if (r ** q === b) {
        lines.push("The denominator " + q + " means " + rootName + ": " + b + "^(" + (q === 1 ? k : k + "/" + q) + ") = (" + rootName + " of " + b + ")" + M.sup(k));
        lines.push("The " + rootName + " of " + b + " is " + r + ", so this is " + r + M.sup(k) + " = " + (r ** k));
        val = r ** k;
      } else {
        val = Math.pow(b, k / q);
        lines.push("The " + rootName + " of " + b + " isn't a whole number, so the answer is irrational: about " + M.fmtNum(parseFloat(val.toPrecision(8))));
      }
    }
    if (p < 0) {
      const exact = Number.isInteger(val);
      lines.push("Answer: " + (exact ? "1/" + val + " = " + M.toDecimal(1, val).text : "1 ÷ " + M.fmtNum(parseFloat(val.toPrecision(8))) + " ≈ " + M.fmtNum(parseFloat((1 / val).toPrecision(8)))));
    } else lines.push("Answer: " + (Number.isInteger(val) ? val : "≈ " + M.fmtNum(parseFloat(val.toPrecision(8)))));
    say(out, lines);
  }
  $("i-go").addEventListener("click", indexUI);
  $("ii").addEventListener("keydown", (e) => { if (e.key === "Enter") indexUI(); });

  /* ---- Standard form converters ---- */
  function sfUI() {
    const raw = $("sf-in").value.replace(/[\s,]/g, "").replace(/−/g, "-");
    if (!/^-?\d*\.?\d+$/.test(raw)) return say($("sf-out"), ["Type a number like 45000 or 0.00032."]);
    const x = parseFloat(raw);
    if (x === 0) return say($("sf-out"), ["Zero can't be written in standard form."]);
    const s = M.toStandardForm(x);
    const lines = [raw + " = " + s.a + " × 10" + M.sup(s.n)];
    if (s.n > 0) lines.push("Move the decimal point " + s.n + " place" + (s.n > 1 ? "s" : "") + " left to get a number between 1 and 10, so the index is +" + s.n + ".");
    else if (s.n < 0) lines.push("Move the decimal point " + (-s.n) + " place" + (s.n < -1 ? "s" : "") + " right to get a number between 1 and 10, so the index is −" + (-s.n) + ".");
    else lines.push("It is already between 1 and 10, so the index is 0.");
    say($("sf-out"), lines);
  }
  $("sf-go").addEventListener("click", sfUI);
  $("sf-in").addEventListener("keydown", (e) => { if (e.key === "Enter") sfUI(); });

  function sbUI() {
    const a = parseFloat($("sa").value), n = parseInt($("sn").value, 10);
    if (!(a >= 1 && a < 10) || !Number.isInteger(n)) return say($("sb-out"), ["A must be at least 1 and less than 10, and n a whole number."]);
    const v = M.shiftDecimal(String(a), n);
    say($("sb-out"), [a + " × 10" + M.sup(n) + " = " + v]);
  }
  $("sa").addEventListener("input", sbUI);
  $("sn").addEventListener("input", () => { const n = parseInt($("sn").value, 10); if (n >= -8 && n <= 8) $("sn-r").value = n; sbUI(); });
  $("sn-r").addEventListener("input", () => { $("sn").value = $("sn-r").value; sbUI(); });

  /* ---- Practice ---- */
  const group = (str) => {
    const [i, f] = str.split(".");
    return i.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + (f ? "." + f : "");
  };
  const near = (x, y) => Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(y));
  const num = (s) => M.parseNumber(String(s).replace(/\s+/g, ""));

  M.registerPractice("indexval", () => {
    const bank = [[2, -3], [5, -2], [10, -1], [3, -2], [7, 0], [4, [1, 2]], [8, [1, 3]], [25, [1, 2]], [27, [2, 3]], [16, [3, 4]],
      [4, [-1, 2]], [9, [-1, 2]], [8, [-2, 3]], [100, [-1, 2]], [64, [2, 3]], [81, [1, 4]]];
    const [b, e] = M.pick(bank);
    let p, q;
    if (Array.isArray(e)) { p = e[0]; q = e[1]; } else { p = e; q = 1; }
    const ans = Math.pow(b, p / q);
    const eStr = q === 1 ? String(p).replace("-", "−") : (p < 0 ? "−" : "") + Math.abs(p) + "/" + q;
    return {
      q: "Work out <span class=\"m\">" + b + "<sup>" + eStr + "</sup></span>. (Give a whole number, fraction or decimal.)",
      check: (s) => near(num(s), ans),
      explain: b + "^(" + eStr.replace("−", "-") + ") = " + (ans >= 1 || ans === 0 ? M.fmtNum(ans) : "1/" + Math.round(1 / ans) + " = " + M.fmtNum(ans)) + ".",
      hint: p === 0 ? "Anything to the power 0 is 1." : p < 0 ? "A negative index means reciprocal: flip it to 1 ÷ (positive index version)." : "The bottom of the fraction is the root, the top is the power."
    };
  });
  M.registerPractice("tostd", () => {
    const A = M.pick(["1.5", "2", "2.4", "3.07", "4.8", "5.6", "6.25", "7.1", "8.9", "9.2"]);
    const n = M.pick([-7, -6, -5, -4, -3, 3, 4, 5, 6, 7, 8]);
    const ord = M.shiftDecimal(A, n);
    return {
      q: "Write <strong>" + group(ord) + "</strong> in standard form. (Type it like 3.2 x 10^4.)",
      check: (s) => { const r = M.parseStandardForm(s); return !!r && r.n === n && near(r.a, parseFloat(A)); },
      explain: group(ord) + " = " + A + " × 10" + M.sup(n) + ".",
      hint: "Move the decimal point until the number is between 1 and 10. The number of places moved is the index (positive for big numbers, negative for small ones)."
    };
  });
  M.registerPractice("fromstd", () => {
    const A = M.pick(["1.5", "2.4", "3.07", "4.8", "5.6", "7.1", "8.25"]);
    const n = M.pick([-5, -4, -3, -2, 2, 3, 4, 5]);
    const ord = M.shiftDecimal(A, n);
    return {
      q: "Write <span class=\"m\">" + A + " × 10<sup>" + String(n).replace("-", "−") + "</sup></span> as an ordinary number.",
      check: (s) => near(num(s), parseFloat(ord)),
      explain: A + " × 10" + M.sup(n) + " = " + group(ord) + ".",
      hint: n > 0 ? "Move the decimal point " + n + " places to the right." : "Move the decimal point " + (-n) + " places to the left."
    };
  });
  M.registerPractice("stdcalc", () => {
    const A = M.pick([1.5, 2, 2.5, 3, 4, 5, 6, 8]), B = M.pick([1.2, 2, 3, 4, 5, 6, 7]);
    const n1 = M.pick([2, 3, 4, 5, 6]), n2 = M.pick([-4, -3, 2, 3, 4, 5]);
    const s = M.toStandardForm(A * B);
    const n = s.n + n1 + n2;
    return {
      q: "Work out <span class=\"m\">(" + A + " × 10<sup>" + String(n1) + "</sup>) × (" + B + " × 10<sup>" + String(n2).replace("-", "−") + "</sup>)</span>. Give your answer in standard form.",
      check: (x) => { const r = M.parseStandardForm(x); return !!r && r.n === n && near(r.a, parseFloat(s.a)); },
      explain: "Multiply " + A + " × " + B + " = " + M.fmtNum(A * B) + " and add indices " + n1 + " + (" + n2 + ") = " + (n1 + n2) + ", then adjust: " + s.a + " × 10" + M.sup(n) + ".",
      hint: "Multiply the numbers, add the indices, then check the first number is between 1 and 10."
    };
  });

  lawUI(); indexUI(); sfUI(); sbUI();
  M.mountAll();
})();
