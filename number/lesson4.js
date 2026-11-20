(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const NS = "http://www.w3.org/2000/svg";
  const say = (el, lines) => { el.textContent = ""; lines.forEach((l) => { const d = document.createElement("div"); d.textContent = l; el.appendChild(d); }); };
  const intVal = (id, lo, hi) => { const v = parseInt($(id).value, 10); return Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : null; };
  const mn = M.minus, par = M.paren;
  const sgn = (n) => (n < 0 ? "−" : "+");

  /* ---- 1. Number line ---- */
  function svgEl(name, attrs, text) {
    const e = document.createElementNS(NS, name);
    Object.keys(attrs).forEach((k) => e.setAttribute(k, attrs[k]));
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function numberLine(a, result) {
    const MIN = -20, MAX = 20, X0 = 25, W = 410, Y = 62, u = W / (MAX - MIN);
    const x = (v) => X0 + (v - MIN) * u;
    const svg = svgEl("svg", { viewBox: "0 0 460 100", role: "img", "aria-label": "Number line from " + mn(a) + " to " + mn(result), width: "100%" });
    svg.setAttribute("style", "max-width:520px");
    svg.appendChild(svgEl("line", { x1: x(MIN), y1: Y, x2: x(MAX), y2: Y, style: "stroke: var(--ink); stroke-width: 2" }));
    for (let v = MIN; v <= MAX; v++) {
      const big = v % 5 === 0;
      svg.appendChild(svgEl("line", { x1: x(v), y1: Y - (big ? 7 : 4), x2: x(v), y2: Y + (big ? 7 : 4), style: "stroke: var(--ink); stroke-width: 1" }));
      if (big) svg.appendChild(svgEl("text", { x: x(v), y: Y + 24, "text-anchor": "middle", style: "fill: var(--ink); font-size: 12px" }, mn(v)));
    }
    if (a !== result) {
      const dir = result > a ? 1 : -1, ax = x(a), bx = x(result);
      svg.appendChild(svgEl("path", { d: "M" + ax + " " + (Y - 10) + " Q" + (ax + bx) / 2 + " " + (Y - 46) + " " + bx + " " + (Y - 12), style: "fill: none; stroke: var(--accent); stroke-width: 3" }));
      svg.appendChild(svgEl("polygon", { points: bx + "," + (Y - 10) + " " + (bx - 6 * dir) + "," + (Y - 20) + " " + (bx - 1 * dir) + "," + (Y - 22), style: "fill: var(--accent)" }));
    }
    svg.appendChild(svgEl("circle", { cx: x(a), cy: Y, r: 6, style: "fill: var(--card); stroke: var(--accent); stroke-width: 3" }));
    svg.appendChild(svgEl("circle", { cx: x(result), cy: Y, r: 6, style: "fill: var(--accent)" }));
    svg.appendChild(svgEl("text", { x: x(a), y: 14, "text-anchor": "middle", style: "fill: var(--ink); font-size: 13px; font-weight: 700" }, "start " + mn(a)));
    if (result !== a) svg.appendChild(svgEl("text", { x: x(result), y: 30, "text-anchor": "middle", style: "fill: var(--accent); font-size: 13px; font-weight: 700" }, "end " + mn(result)));
    return svg;
  }
  function nlUI() {
    const a = intVal("nl-a", -10, 10), b = intVal("nl-b", -10, 10), op = $("nl-op").value;
    if (a === null || b === null) return say($("nl-out"), ["Choose whole numbers from −10 to 10."]);
    const result = op === "+" ? a + b : a - b;
    $("nl-svg").textContent = ""; $("nl-svg").appendChild(numberLine(a, result));
    const expr = mn(a) + (op === "+" ? " + " : " − ") + par(b);
    const lines = [expr + " = " + mn(result)];
    if (op === "+") lines.push(b >= 0 ? "Adding " + b + " moves " + b + " to the right." : "Adding " + mn(b) + " is the same as subtracting " + Math.abs(b) + ", so it moves " + Math.abs(b) + " to the left.");
    else lines.push(b >= 0 ? "Subtracting " + b + " moves " + b + " to the left." : "Subtracting " + mn(b) + " is the same as adding " + Math.abs(b) + ", so it moves " + Math.abs(b) + " to the right.");
    say($("nl-out"), lines);
  }
  ["nl-a", "nl-op", "nl-b"].forEach((id) => $(id).addEventListener("input", nlUI));

  /* ---- 2. Sign rules ---- */
  function srUI() {
    const a = intVal("sr-a", -12, 12), b = intVal("sr-b", -12, 12), op = $("sr-op").value;
    if (a === null || b === null) return say($("sr-out"), ["Choose whole numbers from −12 to 12."]);
    if (op === "d" && b === 0) return say($("sr-out"), ["You can't divide by zero."]);
    const res = op === "x" ? a * b : a / b;
    const sym = op === "x" ? " × " : " ÷ ";
    const lines = [par(a) + sym + par(b) + " = " + mn(parseFloat(res.toFixed(6)))];
    if (a === 0 || res === 0) lines.push("Anything times zero is zero, and zero divided by a number is zero.");
    else if ((a < 0) === (b < 0)) lines.push("The signs are the same (both " + (a < 0 ? "negative" : "positive") + "), so the answer is positive.");
    else lines.push("The signs are different, so the answer is negative.");
    if (op === "d" && a % b !== 0) lines.push("It doesn't divide exactly, so the answer is a decimal.");
    say($("sr-out"), lines);
  }
  ["sr-a", "sr-op", "sr-b"].forEach((id) => $(id).addEventListener("input", srUI));

  /* ---- 4. Squares and cubes ---- */
  function sqUI() {
    const n = parseInt($("sq-n").value, 10);
    $("sq-val").textContent = n;
    const dots = $("sq-dots"); dots.textContent = "";
    dots.style.gridTemplateColumns = "repeat(" + n + ", 1fr)";
    dots.style.maxWidth = Math.min(320, Math.max(60, n * 34)) + "px";
    for (let i = 0; i < n * n; i++) dots.appendChild(document.createElement("i"));
    say($("sq-out"), [n + "² = " + n + " × " + n + " = " + n * n, n + "³ = " + n + " × " + n + " × " + n + " = " + n * n * n]);
  }
  $("sq-n").addEventListener("input", sqUI);

  /* ---- 5. Roots ---- */
  const ROOT_SYM = { 2: "√", 3: "∛", 4: "⁴√" };
  function rtUI() {
    const k = parseInt($("rt-k").value, 10), n = intVal("rt-n", 0, 10000);
    if (n === null) return say($("rt-out"), ["Choose a whole number from 0 to 10 000."]);
    const sym = ROOT_SYM[k], r = M.iroot(n, k);
    if (r !== null) return say($("rt-out"), [sym + n + " = " + r, "Check: " + r + M.sup(k) + " = " + n]);
    const lo = Math.floor(Math.pow(n, 1 / k));
    say($("rt-out"), [sym + n + " is not a whole number.",
      lo + M.sup(k) + " = " + Math.pow(lo, k) + " and " + (lo + 1) + M.sup(k) + " = " + Math.pow(lo + 1, k) + ", so " + sym + n + " is between " + lo + " and " + (lo + 1) + ".",
      "On a calculator: " + sym + n + " ≈ " + M.fmtNum(parseFloat(Math.pow(n, 1 / k).toFixed(4)))]);
  }
  ["rt-k", "rt-n"].forEach((id) => $(id).addEventListener("input", rtUI));

  /* ---- Practice ---- */
  const near = (x, y) => Math.abs(x - y) < 1e-9;
  const num = (s) => M.parseNumber(String(s).replace(/\s+/g, "").replace(/(°c|°|degrees|cm|mm|m)$/i, ""));
  const KEYS = ["−"];

  M.registerPractice("dnarith", () => {
    const kind = M.pick(["add", "sub", "sub", "mul", "div"]);
    const nz = () => M.pick([-9, -8, -7, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8, 9]);
    let a, b, ans, expr, why, hint;
    if (kind === "add") {
      a = nz(); b = nz(); ans = a + b; expr = mn(a) + " + " + par(b);
      why = b < 0 ? "Adding " + mn(b) + " is the same as subtracting " + Math.abs(b) + ": " + mn(a) + " − " + Math.abs(b) + " = " + mn(ans) + "." : mn(a) + " + " + b + " = " + mn(ans) + ".";
      hint = "Picture the number line: adding a positive moves right, adding a negative moves left.";
    } else if (kind === "sub") {
      a = M.rnd(-9, 9); b = nz(); ans = a - b; expr = mn(a) + " − " + par(b);
      why = b < 0 ? "Subtracting " + mn(b) + " is the same as adding " + Math.abs(b) + ": " + mn(a) + " + " + Math.abs(b) + " = " + mn(ans) + "." : mn(a) + " − " + b + " = " + mn(ans) + ".";
      hint = "Subtracting a negative number is the same as adding the positive number.";
    } else if (kind === "mul") {
      a = nz(); b = nz(); ans = a * b; expr = par(a) + " × " + par(b);
      why = ((a < 0) === (b < 0) ? "The signs are the same, so the answer is positive: " : "The signs are different, so the answer is negative: ") + Math.abs(a) + " × " + Math.abs(b) + " = " + Math.abs(ans) + ", so " + mn(ans) + ".";
      hint = "Same signs give a positive answer. Different signs give a negative answer.";
    } else {
      b = nz(); const r = nz(); a = b * r; ans = r; expr = par(a) + " ÷ " + par(b);
      why = ((a < 0) === (b < 0) ? "The signs are the same, so the answer is positive: " : "The signs are different, so the answer is negative: ") + Math.abs(a) + " ÷ " + Math.abs(b) + " = " + Math.abs(ans) + ", so " + mn(ans) + ".";
      hint = "Same signs give a positive answer. Different signs give a negative answer.";
    }
    return { q: "Work out <span class=\"m\">" + expr + "</span>.", keys: KEYS, placeholder: "e.g. −4", check: (s) => near(num(s), ans), explain: why, hint };
  });

  M.registerPractice("dncontext", () => {
    const v = M.rnd(0, 4);
    let q, ans, why, hint = "A rise means add and a fall means subtract. Use a negative number for below zero (or below normal).";
    if (v === 0) {
      const s = -M.rnd(1, 12), r = M.rnd(s * -1 + 1, 18); ans = s + r;
      q = "At 6 am the temperature is <strong>" + mn(s) + "°C</strong>. By noon it has risen by <strong>" + r + "°C</strong>. What is the temperature at noon? (in °C)";
      why = mn(s) + " + " + r + " = " + mn(ans) + "°C.";
    } else if (v === 1) {
      const s = M.rnd(2, 12), f = s + M.rnd(2, 10); ans = s - f;
      q = "At midday the temperature is <strong>" + s + "°C</strong>. By midnight it has fallen by <strong>" + f + "°C</strong>. What is the temperature at midnight? (in °C)";
      why = s + " − " + f + " = " + mn(ans) + "°C.";
    } else if (v === 2) {
      const t1 = M.rnd(3, 12), t2 = -M.rnd(2, 10); ans = t1 - t2;
      q = "The temperature was <strong>" + t1 + "°C</strong> in the afternoon and <strong>" + mn(t2) + "°C</strong> at night. By how many degrees did it fall?";
      why = "Find the difference: " + t1 + " − (" + mn(t2) + ") = " + t1 + " + " + Math.abs(t2) + " = " + ans + " degrees.";
      hint = "To find how much it changed, subtract the lower temperature from the higher one. Subtracting a negative means adding.";
    } else if (v === 3) {
      const s = -M.rnd(10, 60), r = M.rnd(20, 90); ans = s + r;
      q = "A river is <strong>" + Math.abs(s) + " cm below</strong> its normal level. After heavy rain it rises by <strong>" + r + " cm</strong>. What is its level compared with normal? (Use + for above and − for below, in cm.)";
      why = mn(s) + " + " + r + " = " + mn(ans) + " cm, which is " + Math.abs(ans) + " cm " + (ans >= 0 ? "above" : "below") + " normal.";
    } else {
      const s = M.rnd(5, 40), f = M.rnd(s + 5, s + 50); ans = s - f;
      q = "A river is <strong>" + s + " cm above</strong> its normal level. Then the water drops by <strong>" + f + " cm</strong>. What is its level compared with normal? (Use + for above and − for below, in cm.)";
      why = s + " − " + f + " = " + mn(ans) + " cm, which is " + Math.abs(ans) + " cm below normal.";
    }
    return { q, keys: KEYS, placeholder: "a number, like −5", check: (s) => near(num(s), ans), explain: why, hint };
  });

  M.registerPractice("powers", () => {
    const kind = M.pick(["sq", "cu", "sqrt", "cbrt", "r4"]);
    let q, ans, why, hint;
    if (kind === "sq") { const n = M.rnd(2, 15); ans = n * n; q = "Work out <span class=\"m\">" + n + "²</span>."; why = n + " × " + n + " = " + ans + "."; hint = "Multiply the number by itself."; }
    else if (kind === "cu") { const n = M.rnd(2, 10); ans = n ** 3; q = "Work out <span class=\"m\">" + n + "³</span>."; why = n + " × " + n + " × " + n + " = " + ans + "."; hint = "Multiply the number by itself, then by itself again."; }
    else if (kind === "sqrt") { const n = M.rnd(2, 15); ans = n; q = "Work out <span class=\"m\">√" + n * n + "</span>."; why = "√" + n * n + " = " + n + " because " + n + "² = " + n * n + "."; hint = "Which number times itself gives " + n * n + "?"; }
    else if (kind === "cbrt") { const n = M.rnd(2, 10); ans = n; q = "Work out <span class=\"m\">∛" + n ** 3 + "</span>."; why = "∛" + n ** 3 + " = " + n + " because " + n + "³ = " + n ** 3 + "."; hint = "Which number, used three times in a multiplication, gives " + n ** 3 + "?"; }
    else { const n = M.rnd(2, 5); ans = n; q = "Work out <span class=\"m\">⁴√" + n ** 4 + "</span>."; why = "⁴√" + n ** 4 + " = " + n + " because " + n + "⁴ = " + n ** 4 + "."; hint = "Which number, used four times in a multiplication, gives " + n ** 4 + "?"; }
    return { q, placeholder: "a whole number", check: (s) => near(num(s), ans), explain: why, hint };
  });

  M.registerPractice("powmix", () => {
    const term = () => {
      const k = M.pick(["sq", "cu", "sqrt", "cbrt", "r4"]);
      if (k === "sq") { const n = M.rnd(2, 9); return { t: n + "²", v: n * n }; }
      if (k === "cu") { const n = M.rnd(2, 5); return { t: n + "³", v: n ** 3 }; }
      if (k === "sqrt") { const n = M.rnd(2, 12); return { t: "√" + n * n, v: n }; }
      if (k === "cbrt") { const n = M.rnd(2, 6); return { t: "∛" + n ** 3, v: n }; }
      const n = M.rnd(2, 4); return { t: "⁴√" + n ** 4, v: n };
    };
    let a, b, op, ans;
    do {
      a = term(); b = term(); op = M.pick(["+", "−", "×"]);
      if (op === "−" && b.v > a.v) { const t = a; a = b; b = t; }
      ans = op === "+" ? a.v + b.v : op === "−" ? a.v - b.v : a.v * b.v;
    } while (a.t === b.t || ans > 400);
    return {
      q: "Work out <span class=\"m\">" + a.t + " " + op + " " + b.t + "</span>.",
      placeholder: "a whole number",
      check: (s) => near(num(s), ans),
      explain: a.t + " = " + a.v + " and " + b.t + " = " + b.v + ", so " + a.v + " " + op + " " + b.v + " = " + ans + ".",
      hint: "Work out each power or root on its own first, then add, subtract or multiply."
    };
  });

  nlUI(); srUI(); sqUI(); rtUI();
  M.mountAll();
})();
