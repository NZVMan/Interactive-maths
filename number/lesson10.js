(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const R = M.rnd, P = M.pick;
  const num = (s) => M.parseNumber(String(s).replace(/\s+/g, ""));
  const say = (el, lines) => { el.textContent = ""; lines.forEach((l) => { const d = document.createElement("div"); d.textContent = l; el.appendChild(d); }); };
  const range = (n) => Array.from({ length: n }, (_, i) => i + 1);
  const U = range(20);
  const RULES = [
    { id: "even", name: "even numbers", f: (x) => x % 2 === 0 },
    { id: "odd", name: "odd numbers", f: (x) => x % 2 === 1 },
    { id: "m3", name: "multiples of 3", f: (x) => x % 3 === 0 },
    { id: "m4", name: "multiples of 4", f: (x) => x % 4 === 0 },
    { id: "m5", name: "multiples of 5", f: (x) => x % 5 === 0 },
    { id: "f12", name: "factors of 12", f: (x) => 12 % x === 0 },
    { id: "f18", name: "factors of 18", f: (x) => 18 % x === 0 },
    { id: "prime", name: "prime numbers", f: (x) => M.isPrime(x) },
    { id: "sq", name: "square numbers", f: (x) => M.isSquare(x) },
    { id: "gt10", name: "numbers greater than 10", f: (x) => x > 10 }
  ];
  const lst = (a) => "{" + (a.length ? a.join(", ") : "") + "}";
  const rule = (r) => "{x: x is " + (r.name.startsWith("numbers greater") ? "a number greater than 10" : r.name.replace(/s$/, "").replace(/^(even|odd|prime|square) number/, "$1 number").replace(/^multiples? of/, "a multiple of").replace(/^factors? of/, "a factor of").replace(/^even number$/, "an even number").replace(/^odd number$/, "an odd number")) + "}";
  const ruleText = (r) => ({ even: "an even number", odd: "an odd number", m3: "a multiple of 3", m4: "a multiple of 4", m5: "a multiple of 5", f12: "a factor of 12", f18: "a factor of 18", prime: "a prime number", sq: "a square number", gt10: "greater than 10" })[r.id];
  const setOf = (r) => U.filter(r.f);
  const fill = (sel, def) => { RULES.forEach((r, i) => { const o = document.createElement("option"); o.value = i; o.textContent = r.name; sel.appendChild(o); }); sel.value = def; };

  /* ---- 1. Set builder ---- */
  fill($("st-r"), 7);
  function stUI() {
    const r = RULES[+$("st-r").value], s = setOf(r);
    say($("st-out"), ["A = {x: x is " + ruleText(r) + ", x in ℰ}", "A = " + lst(s), "n(A) = " + s.length]);
  }
  $("st-r").addEventListener("input", stUI);

  /* ---- 2. Venn ---- */
  fill($("vn-a"), 0); fill($("vn-b"), 2);
  function lines(arr, per) { const o = []; for (let i = 0; i < arr.length; i += per) o.push(arr.slice(i, i + per).join(", ")); return o; }
  function vnUI() {
    const A = RULES[+$("vn-a").value], B = RULES[+$("vn-b").value];
    const a = U.filter((x) => A.f(x) && !B.f(x)), both = U.filter((x) => A.f(x) && B.f(x)), b = U.filter((x) => B.f(x) && !A.f(x)), none = U.filter((x) => !A.f(x) && !B.f(x));
    const ns = "http://www.w3.org/2000/svg", host = $("vn-svg");
    host.textContent = "";
    const el = (n, at) => { const e = document.createElementNS(ns, n); for (const k in at) e.setAttribute(k, at[k]); return e; };
    const svg = el("svg", { viewBox: "0 0 360 230", width: "100%" }); svg.style.maxWidth = "460px";
    svg.appendChild(el("rect", { x: 3, y: 3, width: 354, height: 224, fill: "none", stroke: "currentColor", "stroke-width": 2 }));
    svg.appendChild(el("circle", { cx: 135, cy: 120, r: 82, fill: "var(--accent)", "fill-opacity": 0.12, stroke: "currentColor", "stroke-width": 2 }));
    svg.appendChild(el("circle", { cx: 225, cy: 120, r: 82, fill: "var(--accent)", "fill-opacity": 0.12, stroke: "currentColor", "stroke-width": 2 }));
    const text = (x, y, arr, anchor, size, per) => {
      const t = el("text", { x, y, "text-anchor": anchor, fill: "currentColor", "font-size": size });
      lines(arr, per).forEach((ln, i) => { const s = el("tspan", { x, dy: i === 0 ? 0 : size + 3 }); s.textContent = ln; t.appendChild(s); });
      svg.appendChild(t);
    };
    const label = (x, y, s) => { const t = el("text", { x, y, fill: "currentColor", "font-size": 15, "font-weight": 700 }); t.textContent = s; svg.appendChild(t); };
    label(10, 22, "ℰ"); label(70, 52, "A"); label(280, 52, "B");
    const top = (arr, per) => 118 - Math.max(0, Math.ceil(arr.length / per) - 1) * 8;
    text(90, top(a, 2), a, "middle", 14, 2); text(180, top(both, 2), both, "middle", 14, 2); text(270, top(b, 2), b, "middle", 14, 2);
    text(12, 44, none, "start", 13, 3);
    host.appendChild(svg);
    host.setAttribute("aria-label", "Venn diagram. A only: " + (a.join(", ") || "none") + ". In both: " + (both.join(", ") || "none") + ". B only: " + (b.join(", ") || "none") + ". Neither: " + (none.join(", ") || "none") + ".");
    const un = U.filter((x) => A.f(x) || B.f(x)), A_ = setOf(A), B_ = setOf(B);
    say($("vn-out"), ["A = " + lst(A_) + ", n(A) = " + A_.length, "B = " + lst(B_) + ", n(B) = " + B_.length,
      "A ∩ B = " + lst(both) + ", n(A ∩ B) = " + both.length, "A ∪ B = " + lst(un), "n(A ∪ B) = " + A_.length + " + " + B_.length + " − " + both.length + " = " + un.length]);
  }
  ["vn-a", "vn-b"].forEach((id) => $(id).addEventListener("input", vnUI));

  /* ---- Practice ---- */
  M.registerPractice("setcount", () => {
    const r = P(RULES), kind = R(0, 1);
    const s = setOf(r);
    if (kind === 0) return { q: "ℰ = {1, 2, 3, …, 20}. <span class=\"m\">A = {x: x is " + ruleText(r) + "}</span>. Find n(A).", placeholder: "a number",
      check: (x) => num(x) === s.length, explain: "A = " + lst(s) + ", so n(A) = " + s.length + ".", hint: "List all the elements of A first, then count them." };
    const k = P([3, 4, 6, 7, 9]), lim = P([30, 40, 50]), cnt = Math.floor(lim / k);
    return { q: "<span class=\"m\">A = {x: x is a multiple of " + k + ", 0 &lt; x ≤ " + lim + "}</span>. Find n(A).", placeholder: "a number",
      check: (x) => num(x) === cnt, explain: "The multiples are " + k + ", " + 2 * k + ", " + 3 * k + ", … up to " + cnt * k + ", so n(A) = " + cnt + ".", hint: "Divide " + lim + " by " + k + " and round down." };
  });

  M.registerPractice("region", () => {
    let A, B; do { A = P(RULES); B = P(RULES); } while (A === B || setOf(A).filter(B.f).length === 0);
    const x = P(U), inA = A.f(x), inB = B.f(x), ans = inA && inB ? "A ∩ B" : inA ? "A only" : inB ? "B only" : "Neither";
    return { q: "ℰ = {1, 2, 3, …, 20}. <span class=\"m\">A = {x: x is " + ruleText(A) + "}</span> and <span class=\"m\">B = {x: x is " + ruleText(B) + "}</span>. Where does <strong>" + x + "</strong> go in the Venn diagram?", choices: ["A only", "A ∩ B", "B only", "Neither"],
      check: (s) => s.trim() === ans,
      explain: x + " is " + (inA ? "" : "not ") + ruleText(A) + " and " + (inB ? "" : "not ") + ruleText(B) + ". Region = " + ans + ".",
      hint: "Test the number against A, then against B. In both means A ∩ B." };
  });

  const parseSet = (s) => { const m = String(s).replace(/[{}]/g, "").split(/[,\s]+/).filter(Boolean); return m.every((t) => /^\d+$/.test(t)) ? Array.from(new Set(m.map(Number))).sort((p, q) => p - q) : null; };
  const same = (a, b) => a && a.length === b.length && a.every((v, i) => v === b[i]);
  M.registerPractice("setops", () => {
    let A, B, I; do { A = P(RULES); B = P(RULES); I = setOf(A).filter(B.f); } while (A === B || I.length < 1 || I.length > 6);
    const a = setOf(A), b = setOf(B), un = U.filter((x) => A.f(x) || B.f(x));
    const head = "<span class=\"m\">A = " + lst(a) + "<br>B = " + lst(b) + "</span><br>";
    const kind = R(0, 2);
    if (kind === 0) return { q: head + "List the elements of A ∩ B, with commas between them.", keys: [","], placeholder: "e.g. 2, 4, 6",
      check: (s) => same(parseSet(s), I), explain: "Elements in both lists = " + I.join(", ") + ".", hint: "A ∩ B means the numbers that are in both A and B." };
    if (kind === 1) return { q: head + "Find n(A ∪ B).", placeholder: "a number",
      check: (s) => num(s) === un.length, explain: "A ∪ B = " + lst(un) + ", so n(A ∪ B) = " + un.length + ".", hint: "A ∪ B is everything in A or B or both. List each number once, then count." };
    return { q: head + "Find n(A ∩ B).", placeholder: "a number",
      check: (s) => num(s) === I.length, explain: "A ∩ B = " + lst(I) + ", so n(A ∩ B) = " + I.length + ".", hint: "Count the numbers that appear in both A and B." };
  });

  M.registerPractice("vencount", () => {
    const only = R(3, 12), both = R(2, 8), onlyB = R(3, 12), none = R(2, 9);
    const nA = only + both, nB = onlyB + both, un = only + both + onlyB, tot = un + none, kind = R(0, 3);
    const given = "ℰ has " + tot + " elements. n(A) = " + nA + ", n(B) = " + nB + ", n(A ∩ B) = " + both + ".";
    if (kind === 0) return { q: given + " Find n(A ∪ B).", placeholder: "a number", check: (s) => num(s) === un, explain: nA + " + " + nB + " − " + both + " = " + un + ".", hint: "n(A ∪ B) = n(A) + n(B) − n(A ∩ B)" };
    if (kind === 1) return { q: given + " How many elements are in neither A nor B?", placeholder: "a number", check: (s) => num(s) === none, explain: "n(A ∪ B) = " + un + ", so neither = " + tot + " − " + un + " = " + none + ".", hint: "First find n(A ∪ B), then subtract it from the total in ℰ." };
    if (kind === 2) return { q: given + " How many are in A only (in A but not in B)?", placeholder: "a number", check: (s) => num(s) === only, explain: nA + " − " + both + " = " + only + ".", hint: "Take the overlap away from n(A)." };
    return { q: "ℰ has " + tot + " elements. " + nA + " are in A, " + nB + " are in B, and " + none + " are in neither. How many are in both A and B?", placeholder: "a number",
      check: (s) => num(s) === both, explain: "In A or B = " + tot + " − " + none + " = " + un + ". Both = " + nA + " + " + nB + " − " + un + " = " + both + ".", hint: "Find n(A ∪ B) = total − neither. Then use n(A ∪ B) = n(A) + n(B) − n(A ∩ B)." };
  });

  stUI(); vnUI();
  M.mountAll();
})();
