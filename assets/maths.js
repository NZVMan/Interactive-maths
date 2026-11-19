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
    const t = unsup(s).toLowerCase().replace(/\s+/g, "").replace(/[×x*·]/g, "x").replace(/10\^?\(?(-?\d+)\)?$/, "10^$1");
    const m = /^(-?\d*\.?\d+)x10\^(-?\d+)$/.exec(t);
    return m ? { a: parseFloat(m[1]), n: parseInt(m[2], 10) } : null;
  }

  function parseNumber(s) {
    s = String(s).trim().replace(/,/g, "").replace(/%$/, "");
    let m;
    if ((m = /^(-?\d+)\/(\d+)$/.exec(s))) return parseInt(m[1], 10) / parseInt(m[2], 10);
    return /^-?\d*\.?\d+$/.test(s) ? parseFloat(s) : NaN;
  }

  const generators = {};
  const registerPractice = (name, fn) => { generators[name] = fn; };

  function mountPractice(el) {
    const gen = generators[el.dataset.practice];
    if (!gen) return;
    let cur, right = 0, tried = 0, answered = false;
    el.classList.add("practice");
    el.innerHTML =
      '<div class="p-q" aria-live="polite"></div>' +
      '<div class="p-row"><input class="p-in" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Your answer">' +
      '<button class="btn p-check" type="button">Check</button>' +
      '<button class="btn ghost p-new" type="button">New question</button></div>' +
      '<div class="p-fb" role="status"></div><div class="p-score"></div>';
    const q = el.querySelector(".p-q"), inp = el.querySelector(".p-in"), fb = el.querySelector(".p-fb"), sc = el.querySelector(".p-score");
    function next() {
      cur = gen(); answered = false;
      q.innerHTML = cur.q; inp.value = ""; fb.textContent = ""; fb.className = "p-fb"; inp.disabled = false; inp.focus({ preventScroll: true });
    }
    function check() {
      if (answered || !inp.value.trim()) return;
      tried++;
      if (cur.check(inp.value)) {
        right++; answered = true; fb.className = "p-fb good"; fb.innerHTML = "✓ Correct. " + (cur.explain || "");
      } else {
        fb.className = "p-fb bad"; fb.innerHTML = cur.hint ? "Not quite. " + cur.hint : "Not quite — have another go, or press New question.";
      }
      sc.textContent = "Correct: " + right + " out of " + tried + " attempts";
    }
    el.querySelector(".p-check").addEventListener("click", check);
    el.querySelector(".p-new").addEventListener("click", next);
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") (answered ? next() : check()); });
    next();
  }
  function mountAll() {
    if (typeof document === "undefined") return;
    document.querySelectorAll("[data-practice]").forEach(mountPractice);
  }

  return {
    sup, gcd, lcm, primeFactors, isPrime, isSquare, isCube, factorCounts, factorString, simplify,
    toDecimal, decimalToFraction, toStandardForm, fromStandardForm, shiftDecimal, fmtNum, classify,
    rnd, pick, parseFactorProduct, sameCounts, parseStandardForm, parseNumber,
    registerPractice, mountAll, _generators: generators
  };
});
