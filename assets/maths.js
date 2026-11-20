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
    const t = unsup(s).replace(/−/g, "-").toLowerCase().replace(/\s+/g, "").replace(/[×x*·]/g, "x").replace(/10\^?\(?(-?\d+)\)?$/, "10^$1");
    const m = /^(-?\d*\.?\d+)x10\^(-?\d+)$/.exec(t);
    return m ? { a: parseFloat(m[1]), n: parseInt(m[2], 10) } : null;
  }

  function parseNumber(s) {
    s = String(s).trim().replace(/−/g, "-").replace(/,/g, "").replace(/%$/, "");
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
        fb.innerHTML = (cur.hint ? "Not quite. " + cur.hint : "Not quite. Have another go.");
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
    sup, gcd, lcm, primeFactors, isPrime, isSquare, isCube, factorCounts, factorString, simplify,
    toDecimal, decimalToFraction, toStandardForm, fromStandardForm, shiftDecimal, fmtNum, classify,
    rnd, pick, parseFactorProduct, sameCounts, parseStandardForm, parseNumber,
    registerPractice, mountAll, progress, _generators: generators
  };
});
