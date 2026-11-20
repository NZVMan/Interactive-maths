/* Shared maths helpers + practice engine.
   Works in the browser (window.M) and in Node (module.exports) so the logic can be tested. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.M = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const SUP = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻" };
  const sup = (n) => String(n).split("").map((c) => SUP[c] || c).join("");

  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; };
  const lcm = (a, b) => (a / gcd(a, b)) * b;

  function primeFactors(n) {
    const out = [];
    for (let p = 2; p * p <= n; p++) while (n % p === 0) { out.push(p); n /= p; }
    if (n > 1) out.push(n);
    return out;
  }
  /* Exact integer k-th root: returns r when r^k === n, otherwise null. */
  function iroot(n, k) {
    if (!Number.isInteger(n) || n < 0) return null;
    const r = Math.round(Math.pow(n, 1 / k));
    for (let c = Math.max(0, r - 1); c <= r + 1; c++) if (Math.pow(c, k) === n) return c;
    return null;
  }
  const minus = (n) => (n < 0 ? "−" + Math.abs(n) : String(n));
  const paren = (n) => (n < 0 ? "(−" + Math.abs(n) + ")" : String(n));
  const isPrime = (n) => Number.isInteger(n) && n > 1 && primeFactors(n).length === 1;
  const isSquare = (n) => Number.isInteger(n) && n >= 0 && Number.isInteger(Math.sqrt(n));
  const isCube = (n) => Number.isInteger(n) && Number.isInteger(Math.round(Math.cbrt(n))) && Math.round(Math.cbrt(n)) ** 3 === n;

  function factorCounts(n) {
    const m = {};
    primeFactors(n).forEach((p) => (m[p] = (m[p] || 0) + 1));
    return m;
  }
  function factorString(n) {
    const m = factorCounts(n);
    return Object.keys(m).map(Number).sort((a, b) => a - b)
      .map((p) => (m[p] > 1 ? p + sup(m[p]) : String(p))).join(" × ");
  }

  function simplify(n, d) {
    const g = gcd(n, d) || 1;
    if (d < 0) { n = -n; d = -d; }
    return [n / g, d / g];
  }

  /* Decimal expansion of n/d with recurring part detected by long division. */
  function toDecimal(n, d) {
    const neg = (n < 0) !== (d < 0);
    n = Math.abs(n); d = Math.abs(d);
    const whole = Math.floor(n / d);
    let rem = n % d;
    const digits = [], seen = {};
    let recurStart = -1;
    while (rem !== 0) {
      if (seen[rem] !== undefined) { recurStart = seen[rem]; break; }
      seen[rem] = digits.length;
      rem *= 10;
      digits.push(Math.floor(rem / d));
      rem %= d;
      if (digits.length > 60) break;
    }
    let text = String(whole);
    if (digits.length) {
      text += ".";
      if (recurStart < 0) text += digits.join("");
      else text += digits.slice(0, recurStart).join("") + "(" + digits.slice(recurStart).join("") + ")";
    }
    return { text: (neg && n !== 0 ? "-" : "") + text, recurring: recurStart >= 0 };
  }

  /* Exact decimal string like "0.375" -> [3, 8] simplified fraction. */
  function decimalToFraction(str) {
    const m = /^(-?)(\d*)\.?(\d*)$/.exec(String(str).trim());
    if (!m || (m[2] === "" && m[3] === "")) return null;
    const dp = m[3].length;
    const num = parseInt((m[2] || "0") + m[3], 10) * (m[1] ? -1 : 1);
    return simplify(num, 10 ** dp);
  }

  /* Standard form using string arithmetic to avoid float noise. */
  function toStandardForm(x) {
    if (x === 0) return { a: "0", n: 0 };
    const [mant, exp] = Math.abs(x).toExponential(12).split("e");
    let a = String(parseFloat(mant));
    return { a: (x < 0 ? "-" : "") + a, n: parseInt(exp, 10) };
  }
  function fromStandardForm(a, n) { return parseFloat((parseFloat(a) + "e" + n)); }

  /* "3.2", 4 -> "32000"; "3.2", -4 -> "0.00032" (string-based, no float noise). */
  function shiftDecimal(aStr, n) {
    let neg = false, t = String(aStr).trim();
    if (t[0] === "-") { neg = true; t = t.slice(1); }
    const dot = t.indexOf(".");
    const digits = t.replace(".", "");
    const pos = (dot === -1 ? t.length : dot) + n;
    let out;
    if (pos <= 0) out = "0." + "0".repeat(-pos) + digits;
    else if (pos >= digits.length) out = digits + "0".repeat(pos - digits.length);
    else out = digits.slice(0, pos) + "." + digits.slice(pos);
    if (out.indexOf(".") !== -1) out = out.replace(/0+$/, "").replace(/\.$/, "");
    out = out.replace(/^0+(?=\d)/, "");
    return (neg ? "-" : "") + out;
  }

  function fmtNum(x) {
    if (!isFinite(x)) return String(x);
    let s = parseFloat(x.toPrecision(12)).toString();
    if (s.indexOf("e") !== -1) s = Number(s).toFixed(12).replace(/\.?0+$/, "");
    return s;
  }

  /* Classify a typed number: integer, decimal, fraction a/b, sqrt(n) / √n, pi / π. */
  function classify(input) {
    const s = String(input).trim().toLowerCase().replace(/\s+/g, "").replace(/−/g, "-");
    if (!s) return null;
    let value, rational = true, label = input.trim();
    let m;
    if (s === "pi" || s === "π") { value = Math.PI; rational = false; label = "π"; }
    else if ((m = /^(?:sqrt\(?|√\(?)(\d+(?:\.\d+)?)\)?$/.exec(s))) {
      value = Math.sqrt(parseFloat(m[1]));
      rational = Number.isInteger(parseFloat(m[1])) ? isSquare(parseFloat(m[1])) : false;
      if (!Number.isInteger(parseFloat(m[1]))) return { error: "Try √ of a whole number, like √2 or √49." };
      label = "√" + m[1];
    } else if ((m = /^(-?\d+)\/(-?\d+)$/.exec(s))) {
      if (parseInt(m[2], 10) === 0) return { error: "You can't divide by zero." };
      value = parseInt(m[1], 10) / parseInt(m[2], 10);
    } else if (/^-?\d*\.?\d+$/.test(s)) value = parseFloat(s);
    else return { error: "Try a whole number, a decimal, a fraction like 3/4, √2 or π." };

    const isInt = Number.isInteger(value);
    const sets = {
      natural: isInt && value >= 1,
      integer: isInt,
      rational,
      irrational: !rational,
      real: true,
      prime: isInt && isPrime(value),
      square: isInt && value >= 0 && isSquare(value),
      cube: isInt && isCube(value)
    };
    return { value, label, sets };
  }


  /* ---------- Fractions (as [numerator, denominator], always simplified, denominator > 0) ---------- */
  const fr = (n, d) => simplify(n, d);
  const fracAdd = (a, b) => fr(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
  const fracSub = (a, b) => fr(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
  const fracMul = (a, b) => fr(a[0] * b[0], a[1] * b[1]);
  const fracDiv = (a, b) => fr(a[0] * b[1], a[1] * b[0]);
  const fracStr = (f) => (f[1] === 1 ? minus(f[0]) : minus(f[0]) + "/" + f[1]);
  function mixedStr(f) {
    const neg = f[0] < 0, n = Math.abs(f[0]), d = f[1];
    if (d === 1 || n < d) return fracStr(f);
    const w = Math.floor(n / d), r = n % d;
    return (neg ? "−" : "") + w + (r ? " " + r + "/" + d : "");
  }
  /* "3/4", "−1/2", "2 1/3", "5" -> [n, d] (simplified), or null */
  function parseFracInput(str) {
    const s = String(str).trim().replace(/−/g, "-").replace(/\s+/g, " ");
    let m;
    if ((m = /^(-?)(\d+) (\d+)\/(\d+)$/.exec(s))) { const d = +m[4]; if (!d) return null; return fr((m[1] ? -1 : 1) * (+m[2] * d + +m[3]), d); }
    if ((m = /^(-?\d+)\s*\/\s*(\d+)$/.exec(s))) { const d = +m[2]; return d ? fr(+m[1], d) : null; }
    if ((m = /^-?\d+$/.exec(s))) return [parseInt(s, 10), 1];
    return null;
  }
  /* Like parseFracInput but also reports whether the student's form is already in simplest terms. */
  function parseFracAnswer(str) {
    const s = String(str).trim().replace(/−/g, "-").replace(/\s+/g, " ");
    const v = parseFracInput(s);
    if (!v) return null;
    let m, simplest = true;
    if ((m = /^-?(\d+) (\d+)\/(\d+)$/.exec(s))) simplest = gcd(+m[2], +m[3]) === 1 && +m[2] < +m[3];
    else if ((m = /^-?(\d+)\s*\/\s*(\d+)$/.exec(s))) simplest = gcd(+m[1], +m[2]) === 1;
    return { n: v[0], d: v[1], simplest };
  }

  /* ---------- Rounding (half up, done on the decimal digits so 1.005 -> 1.01) ---------- */
  function roundDP(x, dp) {
    if (!isFinite(x)) return x;
    const sgn = x < 0 ? -1 : 1, a = Math.abs(x);
    const r = Number(Math.round(Number(a + "e" + dp)) + "e" + (-dp));
    return sgn * (isNaN(r) ? Math.round(a * Math.pow(10, dp)) / Math.pow(10, dp) : r);
  }
  function roundSF(x, sf) {
    if (x === 0 || !isFinite(x)) return x;
    let e = Math.floor(Math.log10(Math.abs(x)));
    if (Math.abs(x) >= Math.pow(10, e + 1)) e += 1;
    const dp = sf - 1 - e;
    if (dp >= 0) return roundDP(x, dp);
    const f = Math.pow(10, -dp);
    return Math.sign(x) * Math.round(Math.abs(x) / f + 1e-12) * f;
  }
  const toFixedDP = (x, dp) => roundDP(x, dp).toFixed(Math.max(0, dp));
  function toSF(x, sf) {
    const r = roundSF(x, sf);
    if (r === 0) return "0";
    const e = Math.floor(Math.log10(Math.abs(r)) + 1e-12);
    const dp = sf - 1 - e;
    return dp > 0 ? r.toFixed(dp) : String(r);
  }

  /* ---------- Expression evaluator that shows its steps (brackets, powers, ×÷, +−) ---------- */
  const OPNAME = { "^": "Power", "*": "Multiply", "/": "Divide", "+": "Add", "-": "Subtract" };
  const OPSYM = { "^": "^", "*": "×", "/": "÷", "+": "+", "-": "−" };
  function tokenise(src) {
    const s = String(src).replace(/\s+/g, "");
    if (!s) return { error: "Type an expression, like 3 + 4 × 2." };
    if (s.length > 60) return { error: "That expression is too long. Keep it under 60 characters." };
    const t = [];
    for (let i = 0; i < s.length;) {
      const c = s[i];
      if (/[0-9.]/.test(c)) {
        let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++;
        const txt = s.slice(i, j);
        if (!/^(\d+\.?\d*|\.\d+)$/.test(txt)) return { error: "I can't read the number " + txt + "." };
        t.push({ k: "num", v: parseFloat(txt) }); i = j; continue;
      }
      if (c === "+") t.push({ k: "op", v: "+" });
      else if (c === "-" || c === "−" || c === "–") t.push({ k: "op", v: "-" });
      else if (c === "×" || c === "*" || c === "x" || c === "X" || c === "·") t.push({ k: "op", v: "*" });
      else if (c === "÷" || c === "/") t.push({ k: "op", v: "/" });
      else if (c === "^") t.push({ k: "op", v: "^" });
      else if (c === "(") t.push({ k: "(" });
      else if (c === ")") t.push({ k: ")" });
      else if (/[²³]/.test(c)) { t.push({ k: "op", v: "^" }); t.push({ k: "num", v: c === "²" ? 2 : 3 }); }
      else return { error: "I can't use the symbol " + c + " here. Use numbers, + − × ÷ ^ and brackets." };
      i++;
    }
    // implicit multiplication: 2(3+4), (1+2)(3+4), (1+2)3
    const u = [];
    t.forEach((tok, idx) => {
      const prev = u[u.length - 1];
      if (prev && (prev.k === "num" || prev.k === ")") && (tok.k === "(" || tok.k === "num")) u.push({ k: "op", v: "*" });
      u.push(tok);
    });
    // unary minus: merge into a number unless followed by a power (so −3² = −9) ; otherwise mark as "neg"
    const out = [];
    for (let i = 0; i < u.length; i++) {
      const tok = u[i], prev = out[out.length - 1];
      const unary = tok.k === "op" && (tok.v === "-" || tok.v === "+") && (!prev || prev.k === "op" || prev.k === "neg" || prev.k === "(");
      if (unary) {
        if (tok.v === "+") continue;
        const nx = u[i + 1], after = u[i + 2];
        if (nx && nx.k === "num" && !(after && after.k === "op" && after.v === "^")) { out.push({ k: "num", v: -nx.v }); i++; }
        else out.push({ k: "neg" });
      } else out.push(tok);
    }
    let depth = 0;
    for (const tok of out) { if (tok.k === "(") depth++; if (tok.k === ")") { depth--; if (depth < 0) return { error: "There is a closing bracket without an opening one." }; } }
    if (depth !== 0) return { error: "A bracket is not closed." };
    return { tokens: out };
  }
  function show(tokens) {
    let out = "";
    tokens.forEach((t, i) => {
      const prev = tokens[i - 1];
      if (t.k === "num") {
        const txt = fmtNum(Math.abs(t.v));
        if (t.v < 0) out += prev && (prev.k === "op" || prev.k === "neg") ? "(−" + txt + ")" : "−" + txt;
        else out += txt;
      } else if (t.k === "op") out += " " + OPSYM[t.v] + " ";
      else if (t.k === "neg") out += "−";
      else out += t.k;
    });
    return out.replace(/ +/g, " ").replace(/\( /g, "(").replace(/ \)/g, ")").trim();
  }
  function flat(tokens) { // pick and perform one operation on a bracket-free list; returns {tokens, note} or {error}
    const isNum = (t) => t && t.k === "num";
    let i = -1;
    for (let j = tokens.length - 1; j >= 0; j--) if (tokens[j].k === "op" && tokens[j].v === "^" && isNum(tokens[j - 1]) && isNum(tokens[j + 1])) { i = j; break; }
    if (i < 0) for (let j = 0; j < tokens.length; j++) if (tokens[j].k === "neg" && isNum(tokens[j + 1])) {
      const v = -tokens[j + 1].v;
      return { tokens: tokens.slice(0, j).concat([{ k: "num", v }], tokens.slice(j + 2)), note: "Make " + fmtNum(tokens[j + 1].v) + " negative: " + fmtNum(v).replace("-", "−") };
    }
    if (i < 0) for (let j = 0; j < tokens.length; j++) if (tokens[j].k === "op" && (tokens[j].v === "*" || tokens[j].v === "/") && isNum(tokens[j - 1]) && isNum(tokens[j + 1])) { i = j; break; }
    if (i < 0) for (let j = 0; j < tokens.length; j++) if (tokens[j].k === "op" && (tokens[j].v === "+" || tokens[j].v === "-") && isNum(tokens[j - 1]) && isNum(tokens[j + 1])) { i = j; break; }
    if (i < 0) return { error: "That expression doesn't make sense. Check for a missing number or a double operation." };
    const a = tokens[i - 1].v, b = tokens[i + 1].v, op = tokens[i].v;
    let v;
    if (op === "^") { if (a === 0 && b < 0) return { error: "You can't divide by zero." }; v = Math.pow(a, b); if (!isFinite(v) || Math.abs(v) > 1e12) return { error: "That number gets too big for this tool." }; }
    else if (op === "*") v = a * b;
    else if (op === "/") { if (b === 0) return { error: "You can't divide by zero." }; v = a / b; }
    else if (op === "+") v = a + b; else v = a - b;
    v = parseFloat(v.toPrecision(12));
    const pa = a < 0 ? "(" + fmtNum(a).replace("-", "−") + ")" : fmtNum(a), pb = b < 0 ? "(" + fmtNum(b).replace("-", "−") + ")" : fmtNum(b);
    const res = fmtNum(v).replace("-", "−");
    return { tokens: tokens.slice(0, i - 1).concat([{ k: "num", v }], tokens.slice(i + 2)), note: OPNAME[op] + ": " + pa + " " + OPSYM[op] + " " + pb + " = " + res };
  }
  function evalSteps(src) {
    const tk = tokenise(src);
    if (tk.error) return { error: tk.error };
    let tokens = tk.tokens;
    const steps = [];
    for (let guard = 0; guard < 60; guard++) {
      if (tokens.length === 1 && tokens[0].k === "num") return { ok: true, start: show(tk.tokens), steps, result: tokens[0].v };
      // drop brackets around a single number
      let changed = false;
      for (let i = 0; i + 2 < tokens.length; i++) if (tokens[i].k === "(" && tokens[i + 1].k === "num" && tokens[i + 2].k === ")") { tokens = tokens.slice(0, i).concat([tokens[i + 1]], tokens.slice(i + 3)); changed = true; break; }
      if (changed) continue;
      // innermost bracket
      let open = -1, close = -1;
      for (let i = 0; i < tokens.length; i++) { if (tokens[i].k === "(") open = i; if (tokens[i].k === ")") { close = i; break; } }
      let r;
      if (open >= 0 && close > open) {
        const inner = tokens.slice(open + 1, close);
        r = flat(inner);
        if (r.error) return { error: r.error };
        r.tokens = tokens.slice(0, open + 1).concat(r.tokens, tokens.slice(close));
        r.note = "Brackets first. " + r.note;
      } else {
        r = flat(tokens);
        if (r.error) return { error: r.error };
      }
      tokens = r.tokens;
      for (let i = 0; i + 2 < tokens.length; i++) if (tokens[i].k === "(" && tokens[i + 1].k === "num" && tokens[i + 2].k === ")") { tokens = tokens.slice(0, i).concat([tokens[i + 1]], tokens.slice(i + 3)); i = -1; }
      steps.push({ note: r.note, expr: show(tokens) });
    }
    return { error: "That took too many steps for this tool." };
  }

  /* ---------- Time ---------- */
  /* "3:25", "15:25", "3.25pm", "7:45 am", "0745", "noon" -> minutes after midnight, or null */
  function parseTime(str) {
    let s = String(str).trim().toLowerCase().replace(/\s+/g, "").replace(/\./g, ":");
    if (s === "noon" || s === "midday") return 720;
    if (s === "midnight") return 0;
    const m = /^(\d{1,2}):?(\d{2})?(am|pm)?$/.exec(s);
    if (!m) return null;
    let h = +m[1]; const mi = m[2] ? +m[2] : 0;
    if (mi > 59) return null;
    if (m[3]) { if (h < 1 || h > 12) return null; if (m[3] === "am") h = h % 12; else h = (h % 12) + 12; }
    else if (h > 24 || (h === 24 && mi > 0)) return null;
    return (h % 24) * 60 + mi;
  }
  const pad2 = (n) => (n < 10 ? "0" : "") + n;
  const fmt24 = (min) => pad2(Math.floor(((min % 1440) + 1440) % 1440 / 60)) + ":" + pad2(((min % 60) + 60) % 60);
  function fmt12(min) {
    const m = ((min % 1440) + 1440) % 1440, h = Math.floor(m / 60), mi = m % 60;
    return ((h % 12) || 12) + ":" + pad2(mi) + " " + (h < 12 ? "am" : "pm");
  }
  function durationStr(min) {
    const h = Math.floor(min / 60), m = min % 60;
    return (h ? h + " h" : "") + (h && m ? " " : "") + (m || !h ? m + " min" : "");
  }

  /* ---------- Clock and dial pictures (SVG markup strings; numbers only, no user text) ---------- */
  function clockSVG(h, m, size) {
    size = size || 170;
    const c = 100, pt = (deg, r) => [(c + r * Math.sin(deg * Math.PI / 180)).toFixed(1), (c - r * Math.cos(deg * Math.PI / 180)).toFixed(1)];
    let g = '<circle cx="100" cy="100" r="94" style="fill: var(--card); stroke: var(--ink); stroke-width: 3"/>';
    for (let i = 0; i < 60; i++) {
      const a = pt(i * 6, i % 5 === 0 ? 80 : 86), b = pt(i * 6, 92);
      g += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" style="stroke: var(--ink); stroke-width: ' + (i % 5 === 0 ? 2.5 : 1) + '"/>';
    }
    for (let i = 1; i <= 12; i++) { const p = pt(i * 30, 66); g += '<text x="' + p[0] + '" y="' + (+p[1] + 6) + '" text-anchor="middle" style="fill: var(--ink); font-size: 17px; font-weight: 600">' + i + "</text>"; }
    const hh = pt(((h % 12) + m / 60) * 30, 48), mm = pt(m * 6, 74);
    g += '<line x1="100" y1="100" x2="' + hh[0] + '" y2="' + hh[1] + '" style="stroke: var(--ink); stroke-width: 6; stroke-linecap: round"/>';
    g += '<line x1="100" y1="100" x2="' + mm[0] + '" y2="' + mm[1] + '" style="stroke: var(--accent); stroke-width: 3.5; stroke-linecap: round"/>';
    g += '<circle cx="100" cy="100" r="5" style="fill: var(--ink)"/>';
    return '<svg viewBox="0 0 200 200" width="' + size + '" height="' + size + '" role="img" aria-label="Analogue clock" style="display:block;margin:8px 0">' + g + "</svg>";
  }
  function dialSVG(value, max, major, minor, unit, size) {
    size = size || 220;
    const c = 100, a0 = -135, span = 270, pt = (deg, r) => [(c + r * Math.sin(deg * Math.PI / 180)).toFixed(1), (c - r * Math.cos(deg * Math.PI / 180)).toFixed(1)];
    let g = '<circle cx="100" cy="100" r="94" style="fill: var(--card); stroke: var(--ink); stroke-width: 3"/>';
    for (let v = 0; v <= max + 1e-9; v += minor) {
      const isMajor = Math.abs(v / major - Math.round(v / major)) < 1e-9, ang = a0 + span * v / max;
      const a = pt(ang, isMajor ? 72 : 80), b = pt(ang, 88);
      g += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" style="stroke: var(--ink); stroke-width: ' + (isMajor ? 2.5 : 1) + '"/>';
      if (isMajor) { const p = pt(ang, 58); g += '<text x="' + p[0] + '" y="' + (+p[1] + 5) + '" text-anchor="middle" style="fill: var(--ink); font-size: 14px; font-weight: 600">' + v + "</text>"; }
    }
    const n = pt(a0 + span * value / max, 70);
    g += '<line x1="100" y1="100" x2="' + n[0] + '" y2="' + n[1] + '" style="stroke: var(--bad); stroke-width: 3.5; stroke-linecap: round"/><circle cx="100" cy="100" r="6" style="fill: var(--ink)"/>';
    if (unit) g += '<text x="100" y="150" text-anchor="middle" style="fill: var(--muted); font-size: 13px">' + unit + "</text>";
    return '<svg viewBox="0 0 200 200" width="' + size + '" height="' + size + '" role="img" aria-label="Dial with a needle" style="display:block;margin:8px 0">' + g + "</svg>";
  }

  /* ---------- Practice engine ---------- */
  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (arr) => arr[rnd(0, arr.length - 1)];

  function parseFactorProduct(s) {
    s = String(s).toLowerCase().replace(/[×x*·]/g, "*").replace(/\s+/g, "").replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (c) => "^" + "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(c));
    s = s.replace(/\^(\d)\^(\d)/g, "^$1$2");
    if (!s) return null;
    const m = {};
    for (const tok of s.split("*")) {
      const t = /^(\d+)(?:\^(\d+))?$/.exec(tok);
      if (!t) return null;
      const p = parseInt(t[1], 10), k = t[2] ? parseInt(t[2], 10) : 1;
      m[p] = (m[p] || 0) + k;
    }
    return m;
  }
  const sameCounts = (a, b) => {
    const ka = Object.keys(a), kb = Object.keys(b);
    return ka.length === kb.length && ka.every((k) => a[k] === b[k]);
  };

  const unsup = (s) => String(s).replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, (m) => "^" + m.split("").map((c) => (c === "⁻" ? "-" : "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(c))).join(""));

  function parseStandardForm(s) {
    const t = unsup(s).replace(/−/g, "-").toLowerCase().replace(/\s+/g, "").replace(/[×x*·]/g, "x").replace(/10\^?\(?(-?\d+)\)?$/, "10^$1");
    const m = /^(-?\d*\.?\d+)x10\^(-?\d+)$/.exec(t);
    return m ? { a: parseFloat(m[1]), n: parseInt(m[2], 10) } : null;
  }

  function parseNumber(s) {
    s = String(s).trim().replace(/−/g, "-").replace(/,/g, "").replace(/%$/, "").replace(/^\+/, "");
    let m;
    if ((m = /^(-?\d+)\/(\d+)$/.exec(s))) return parseInt(m[1], 10) / parseInt(m[2], 10);
    return /^-?\d*\.?\d+$/.test(s) ? parseFloat(s) : NaN;
  }

  const generators = {};
  const registerPractice = (name, fn) => { generators[name] = fn; };

  /* ---- Progress (saved in this browser only; falls back to memory if storage is blocked) ---- */
  const store = (function () {
    try { const k = "__im"; localStorage.setItem(k, "1"); localStorage.removeItem(k); return localStorage; }
    catch (e) { const m = {}; return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); } }; }
  })();
  const fileName = () => (typeof location !== "undefined" ? location.pathname.split("/").pop() : "") || "index.html";
  const doneKey = (f) => "im:v1:" + f + ":done", totalKey = (f) => "im:v1:" + f + ":total";
  function readDone(f) { try { return JSON.parse(store.getItem(doneKey(f)) || "[]"); } catch (e) { return []; } }
  function markDone(f, name) { const d = readDone(f); if (d.indexOf(name) === -1) { d.push(name); store.setItem(doneKey(f), JSON.stringify(d)); } }
  function progress(f) { return { done: readDone(f).length, total: parseInt(store.getItem(totalKey(f)) || "0", 10) }; }

  const SET_SIZE = 5;

  function mountPractice(el, index, total) {
    const name = el.dataset.practice, gen = generators[name];
    if (!gen) return;
    const file = fileName();
    let cur, q = 0, firstTry = 0, attempts = 0, answered = false, revealed = false;
    el.classList.add("practice");
    el.innerHTML =
      '<div class="p-head"><span class="p-count"></span><span class="p-done" hidden>✓ Completed</span></div>' +
      '<div class="p-q" aria-live="polite"></div>' +
      '<div class="p-choices" hidden></div>' +
      '<div class="p-row"><input class="p-in" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" aria-label="Your answer">' +
      '<button class="btn p-check" type="button">Check</button></div>' +
      '<div class="p-keys" role="group" aria-label="Symbol buttons" hidden></div>' +
      '<div class="p-fb" role="status"></div>' +
      '<div class="p-actions"><button class="btn ghost p-show" type="button" hidden>Show me the answer</button><button class="btn p-next" type="button" hidden>Next ›</button></div>' +
      '<div class="p-result" hidden></div>';
    const $ = (c) => el.querySelector(c);
    const head = $(".p-count"), doneTag = $(".p-done"), qEl = $(".p-q"), choices = $(".p-choices"), row = $(".p-row"),
      inp = $(".p-in"), keys = $(".p-keys"), fb = $(".p-fb"), show = $(".p-show"), nextBtn = $(".p-next"), result = $(".p-result");

    if (readDone(file).indexOf(name) !== -1) doneTag.hidden = false;

    function insert(txt) {
      const s = inp.selectionStart == null ? inp.value.length : inp.selectionStart, e = inp.selectionEnd == null ? s : inp.selectionEnd;
      inp.value = inp.value.slice(0, s) + txt + inp.value.slice(e);
      inp.focus(); inp.setSelectionRange(s + txt.length, s + txt.length);
    }
    function load() {
      cur = gen(); answered = false; revealed = false; attempts = 0;
      result.hidden = true; qEl.hidden = false; fb.hidden = false;
      head.textContent = "Question " + (q + 1) + " of " + SET_SIZE + (firstTry ? " · " + firstTry + " right first time" : "");
      qEl.innerHTML = cur.q;
      fb.textContent = ""; fb.className = "p-fb";
      show.hidden = true; nextBtn.hidden = true;
      inp.value = ""; inp.disabled = false; inp.placeholder = cur.placeholder || "";
      $(".p-check").disabled = false;
      keys.textContent = "";
      (cur.keys || []).forEach((k) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "key-btn"; b.textContent = k; b.setAttribute("aria-label", "Insert " + k);
        b.addEventListener("click", () => insert(k));
        keys.appendChild(b);
      });
      keys.hidden = !(cur.keys && cur.keys.length);
      choices.textContent = "";
      if (cur.choices) {
        cur.choices.forEach((c) => {
          const b = document.createElement("button");
          b.type = "button"; b.className = "btn ghost choice"; b.textContent = c;
          b.addEventListener("click", () => { if (!answered) { inp.value = c; check(); } });
          choices.appendChild(b);
        });
      }
      choices.hidden = !cur.choices;
      row.hidden = !!cur.choices;
    }
    function finishQuestion(ok) {
      answered = true;
      inp.disabled = true; $(".p-check").disabled = true;
      choices.querySelectorAll("button").forEach((b) => (b.disabled = true));
      show.hidden = true; nextBtn.hidden = false;
      nextBtn.textContent = q === SET_SIZE - 1 ? "See my result" : "Next ›";
      nextBtn.focus({ preventScroll: true });
      if (ok && attempts === 0 && !revealed) firstTry++;
    }
    function check() {
      if (answered || !inp.value.trim()) return;
      if (cur.check(inp.value)) {
        fb.className = "p-fb good"; fb.innerHTML = "✓ Correct. " + (cur.explain || "");
        finishQuestion(true);
      } else {
        attempts++;
        fb.className = "p-fb bad";
        fb.innerHTML = (cur.hint ? "Not quite. " + (typeof cur.hint === "function" ? cur.hint(inp.value) : cur.hint) : "Not quite. Have another go.");
        if (attempts >= 2) show.hidden = false;
        if (cur.choices) { inp.value = ""; }
        else inp.focus({ preventScroll: true });
      }
    }
    function reveal() {
      revealed = true;
      fb.className = "p-fb bad"; fb.innerHTML = "Here it is: " + (cur.explain || "") + " Try the next one.";
      finishQuestion(false);
    }
    function next() {
      if (q === SET_SIZE - 1) return finishSet();
      q++; load(); if (!cur.choices) inp.focus({ preventScroll: true });
    }
    function finishSet() {
      markDone(file, name); doneTag.hidden = false;
      qEl.hidden = true; fb.hidden = true; row.hidden = true; keys.hidden = true; choices.hidden = true; nextBtn.hidden = true; show.hidden = true;
      head.textContent = "Set finished";
      const msg = firstTry === SET_SIZE ? "Perfect: all " + SET_SIZE + " right first time." : firstTry >= 3 ? "Good work: " + firstTry + " of " + SET_SIZE + " right first time." : firstTry + " of " + SET_SIZE + " right first time. Worth another go: practice makes it stick.";
      result.hidden = false; result.textContent = "";
      const p = document.createElement("p"); p.textContent = msg; result.appendChild(p);
      const again = document.createElement("button"); again.type = "button"; again.className = "btn"; again.textContent = "Do another set";
      again.addEventListener("click", () => { q = 0; firstTry = 0; load(); if (!cur.choices) inp.focus({ preventScroll: true }); });
      result.appendChild(again);
      again.focus({ preventScroll: true });
    }
    $(".p-check").addEventListener("click", check);
    show.addEventListener("click", reveal);
    nextBtn.addEventListener("click", next);
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); answered ? next() : check(); } });
    load();
  }

  /* ---- "On this page" jump links ---- */
  function buildToc() {
    const obj = document.querySelector("main .obj");
    const hs = Array.from(document.querySelectorAll("main h2"));
    if (!obj || hs.length < 3 || document.querySelector("nav.toc")) return;
    const nav = document.createElement("nav");
    nav.className = "toc"; nav.setAttribute("aria-label", "On this page");
    const t = document.createElement("strong"); t.textContent = "On this page"; nav.appendChild(t);
    const ol = document.createElement("ol");
    hs.forEach((h, i) => {
      if (!h.id) h.id = "sec-" + (i + 1);
      const li = document.createElement("li"), a = document.createElement("a");
      a.href = "#" + h.id; a.textContent = h.textContent.replace(/^\d+\.\s*/, "");
      li.appendChild(a); ol.appendChild(li);
    });
    nav.appendChild(ol);
    obj.insertAdjacentElement("afterend", nav);
  }

  function mountAll() {
    if (typeof document === "undefined") return;
    buildToc();
    const els = Array.from(document.querySelectorAll("[data-practice]"));
    store.setItem(totalKey(fileName()), String(els.length));
    els.forEach((el, i) => mountPractice(el, i, els.length));
  }

  return {
    sup, minus, paren, iroot, gcd, lcm, primeFactors,
    fracAdd, fracSub, fracMul, fracDiv, fracStr, mixedStr, parseFracInput, parseFracAnswer,
    roundDP, roundSF, toFixedDP, toSF, evalSteps, parseTime, fmt24, fmt12, durationStr, clockSVG, dialSVG, isPrime, isSquare, isCube, factorCounts, factorString, simplify,
    toDecimal, decimalToFraction, toStandardForm, fromStandardForm, shiftDecimal, fmtNum, classify,
    rnd, pick, parseFactorProduct, sameCounts, parseStandardForm, parseNumber,
    registerPractice, mountAll, progress, _generators: generators
  };
});
