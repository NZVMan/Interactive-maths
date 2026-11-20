(function () {
  "use strict";
  const { $, say, chips } = A.ui, R = M.rnd, P = M.pick, MINUS = A.MINUS;
  const KEYS = ["x", "y", "²", "(", ")", "−"];
  const ps = (p) => A.polyStr(p);
  const unkey = (k) => { const m = {}; (k.match(/[a-zA-Zπ]-?\d+/g) || []).forEach((t) => { m[t[0]] = +t.slice(1); }); return m; };

  /* ---- expand stepper ---- */
  function exUI() {
    const out = $("ex-out"), n0 = A.tryParse($("ex-in").value); if (!n0) return say(out, ["Type something like 3x(2x − 4y) or −2(x − 3)."]);
    let n = n0, sign = 1; if (n.t === "neg") { sign = -1; n = n.a; }
    let mult, br;
    if (n.t === "bin" && n.op === "*") { if (n.b.t === "paren" && A.terms(n.b.a).length > 1) { br = n.b.a; mult = n.a; } else if (n.a.t === "paren" && A.terms(n.a.a).length > 1) { br = n.a.a; mult = n.b; } }
    if (!br) { try { return say(out, ["Not a single bracket. Expanded: " + ps(A.poly(n0))]); } catch (e) { return say(out, ["I couldn't read that."]); } }
    let m; try { m = A.poly(mult); } catch (e) { return say(out, ["Use a number or term outside the bracket."]); }
    if (sign < 0) m = A.padd(new Map(), m, -1);
    const lines = ["Multiply every term inside by " + ps(m) + (ps(m)[0] === MINUS ? " (a negative changes each sign)" : "") + ":"]; let tot = new Map();
    A.terms(br).forEach((t) => { const q = A.poly(t), pr = A.pmul(m, q); tot = A.padd(tot, pr); lines.push(ps(m) + " × " + (ps(q)[0] === MINUS ? "(" + ps(q) + ")" : ps(q)) + " = " + ps(pr)); });
    lines.push("Answer: " + ps(tot)); say(out, lines);
  }
  chips($("ex-ch"), ["3x(2x − 4y)", "−2(x − 3)", "5(2a + 3b − 1)", "−x(x + 4)"], (e) => { $("ex-in").value = e; exUI(); });
  $("ex-in").addEventListener("input", exUI);

  /* ---- common factor finder ---- */
  function hcfOf(p) {
    const items = Array.from(p.entries()); if (items.length < 2) return null;
    if (items.some(([k, c]) => !Number.isInteger(c))) return null;
    const g = items.map(([k, c]) => Math.abs(c)).reduce((a, b) => A.gcd(a, b), 0), vars = {};
    const ms = items.map(([k]) => unkey(k)); const all = new Set(); ms.forEach((m) => Object.keys(m).forEach((v) => all.add(v)));
    all.forEach((v) => { const e = Math.min(...ms.map((m) => m[v] || 0)); if (e > 0) vars[v] = e; });
    return { g, vars };
  }
  function fcUI() {
    const out = $("fc-out"), p = A.tryPoly($("fc-in").value); if (!p || p.size < 2) return say(out, ["Type an expression with two or more terms, like 9x² + 15xy."]);
    const h = hcfOf(p); if (!h) return say(out, ["Use whole-number coefficients."]);
    const hm = new Map([[Object.keys(h.vars).sort().map((v) => v + h.vars[v]).join(""), h.g]]); const hs = ps(hm);
    if (h.g === 1 && !Object.keys(h.vars).length) return say(out, ["The HCF is 1, so there is nothing to take out. This expression can't be factorised this way."]);
    const lines = ["HCF of the numbers: " + h.g, "Letters in every term: " + (Object.keys(h.vars).length ? Object.keys(h.vars).sort().map((v) => v + (h.vars[v] > 1 ? A.sup(h.vars[v]) : "")).join(" ") : "none"), "Take out: " + hs];
    let inner = new Map();
    p.forEach((c, k) => { const m = unkey(k), q = {}; for (const v in m) { const e = m[v] - (h.vars[v] || 0); if (e > 0) q[v] = e; } const key = Object.keys(q).sort().map((v) => v + q[v]).join(""); inner.set(key, c / h.g); lines.push(ps(new Map([[k, c]])) + " ÷ " + hs + " = " + ps(new Map([[key, c / h.g]]))); });
    lines.push("Answer: " + hs + "(" + ps(inner) + ")"); say(out, lines);
  }
  chips($("fc-ch"), ["9x² + 15xy", "6x + 12", "x² + 5x", "12ab − 8a", "4x² − 10x"], (e) => { $("fc-in").value = e; fcUI(); });
  $("fc-in").addEventListener("input", fcUI);

  /* ---- practice ---- */
  const lin = (a, b) => A.polyStr(new Map([["x1", a], ["", b]]));
  const wr = (c, v) => (c === 1 ? "" : c === -1 ? "-" : c) + v;
  M.registerPractice("expand1", () => {
    const k = R(0, 3); let src;
    if (k === 0) src = R(2, 9) + "(" + R(2, 6) + "x+" + R(1, 9) + ")";
    else if (k === 1) src = "-" + R(2, 7) + "(x-" + R(2, 9) + ")";
    else if (k === 2) src = R(2, 5) + "x(" + R(2, 5) + "x-" + R(2, 6) + "y)";
    else src = P(["", "-"]) + P(["x", "2x", "3a", "4y"]) + "(" + P(["x", "2x", "a"]) + "+" + R(2, 7) + ")";
    const p = A.poly(src);
    return { q: "Expand <span class=\"m\">" + A.disp(src) + "</span>.", keys: KEYS, placeholder: "e.g. 6x² − 12xy", check: (s) => A.checkExpanded(s, p).ok, explain: A.disp(src) + " = " + A.polyStr(p) + ".",
      hint: (s) => { const r = A.checkExpanded(s, p); return r.why === "brackets" ? "Your answer still has brackets. Multiply out every term." : r.why === "collect" ? "Collect the like terms." : "Multiply every term inside the bracket by the term outside. Watch the signs: negative × negative = positive."; } };
  });
  M.registerPractice("expand2", () => {
    const a = R(2, 5), b = R(1, 6), c = R(2, 5), d = R(1, 6), k = R(0, 2); let src;
    if (k === 0) src = a + "(x+" + b + ")+" + c + "(x-" + d + ")";
    else if (k === 1) src = a + "(2x-" + b + ")-" + c + "(x+" + d + ")";
    else src = "x(x+" + b + ")+" + c + "(x-" + d + ")";
    const p = A.poly(src);
    return { q: "Expand and simplify <span class=\"m\">" + A.disp(src) + "</span>.", keys: KEYS, placeholder: "e.g. 5x + 3", check: (s) => A.checkExpanded(s, p).ok, explain: A.disp(src) + " = " + A.polyStr(p) + ".",
      hint: (s) => { const r = A.checkExpanded(s, p); return r.why === "collect" ? "Collect the like terms." : "Expand each bracket first, then collect like terms. A minus in front of a bracket changes every sign inside it."; } };
  });
  const hintF = (r) => (r.why === "notfactorised" ? "Write the answer with a bracket, like 3(x + 2)." : r.why === "notfully" ? "You can take out more. Check whether the numbers or letters inside the bracket still have a common factor." : r.why === "wrong" ? "Expand your answer to check it. It should give back the starting expression." : "Type it like 3x(3x + 5y).");
  M.registerPractice("factor1", () => {
    const h = R(2, 9), a = R(1, 6), b = R(1, 9) * P([1, -1]); let tries = 0, g;
    do { g = A.gcd(a, b); } while (g > 1 && tries++ < 0 );
    const aa = g > 1 ? a / g : a, bb = g > 1 ? b / g : b;
    const inner = lin(aa, bb), expanded = A.poly(h + "(" + aa + "x+" + bb + ")"), ans = h + "(" + A.disp(aa === 1 ? "x" : aa + "x") + (bb < 0 ? " − " + -bb : " + " + bb) + ")";
    return { q: "Factorise <span class=\"m\">" + A.polyStr(expanded) + "</span> fully.", keys: KEYS, placeholder: "e.g. 3(x + 2)", check: (s) => A.checkFactorised(s, expanded, 1).ok, explain: A.polyStr(expanded) + " = " + ans.replace(/\s+/g, " ") + ".", hint: (s) => hintF(A.checkFactorised(s, expanded, 1)) };
  });
  const cop = (l1, h1, l2, h2) => { let a, b; do { a = R(l1, h1); b = R(l2, h2); } while (A.gcd(a, b) !== 1); return [a, b]; };
  M.registerPractice("factor2", () => {
    const k = R(0, 3); let src;
    if (k === 0) src = "x(x+" + R(2, 9) + ")";
    else if (k === 1) { const g = R(2, 5), [a, b] = cop(1, 4, 1, 4); src = g + "x(" + (a === 1 ? "" : a) + "x+" + b + "y)"; }
    else if (k === 2) { const g = R(2, 5), [a, b] = cop(2, 4, 1, 3); src = g + "a(" + a + "b-" + b + ")"; }
    else { const [a, b] = cop(2, 5, 1, 4); src = "x(" + a + "x-" + b + ")"; }
    const expanded = A.poly(src);
    return { q: "Factorise <span class=\"m\">" + A.polyStr(expanded) + "</span> fully.", keys: KEYS, placeholder: "e.g. 3x(3x + 5y)", check: (s) => A.checkFactorised(s, expanded, 1).ok, explain: A.polyStr(expanded) + " = " + A.disp(src) + ".", hint: (s) => hintF(A.checkFactorised(s, expanded, 1)) };
  });
  exUI(); fcUI();
  M.mountAll();
})();
