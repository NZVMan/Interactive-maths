(function () {
  "use strict";
  const R = M.rnd, P = M.pick, KEYS = ["x", "y", "²", "(", ")", "−"];
  const nz = (lo, hi) => { let v; do { v = R(lo, hi); } while (v === 0); return v; };
  const sg = (n) => (n < 0 ? "− " + -n : "+ " + n);
  const xs = (a) => (a === 1 ? "x" : a === -1 ? "−x" : a + "x");
  const kinds = {
    expand() { const a = R(2, 5), b = nz(-6, 6), c = nz(-6, 6), src = a + "(x" + (b < 0 ? "-" : "+") + Math.abs(b) + ")(x" + (c < 0 ? "-" : "+") + Math.abs(c) + ")"; const p = A.poly(src);
      return { q: "Expand and simplify <span class=\"m\">" + A.disp(src) + "</span>.", keys: KEYS, placeholder: "e.g. 2x² + 6x + 4", check: (s) => A.checkExpanded(s, p).ok, explain: A.disp(src) + " = " + A.polyStr(p) + ".", hint: "Expand the brackets, collect like terms, then multiply by " + a + "." }; },
    factorise() { const b = nz(-7, 7), c = nz(-7, 7), t = A.poly("(x" + (b < 0 ? "-" : "+") + Math.abs(b) + ")(x" + (c < 0 ? "-" : "+") + Math.abs(c) + ")");
      return { q: "Factorise <span class=\"m\">" + A.polyStr(t) + "</span>.", keys: KEYS, placeholder: "e.g. (x + 2)(x + 3)", check: (s) => A.checkFactorised(s, t, 2).ok, explain: A.polyStr(t) + " = (x " + sg(b) + ")(x " + sg(c) + ").", hint: "Find two numbers with product " + b * c + " and sum " + (b + c) + "." }; },
    indices() { const a = R(2, 7), b = R(2, 6), op = P(["*", "/"]); const src = op === "*" ? "x^" + a + "*x^" + b : "x^" + (a + b) + "/x^" + b; const ans = op === "*" ? a + b : a;
      return { q: "Simplify <span class=\"m\">" + A.disp(src) + "</span>.", keys: KEYS, placeholder: "e.g. x⁷", check: (s) => A.checkExpanded(s, A.poly("x^" + ans)).ok, explain: A.disp(src) + " = x" + A.sup(ans) + ".", hint: op === "*" ? "Add the indices." : "Subtract the indices." }; },
    solve() { const a = nz(2, 6), x0 = nz(-8, 8), b = nz(-9, 9), c = a * x0 + b, src = a + "x" + (b < 0 ? "-" : "+") + Math.abs(b) + "=" + c;
      return { q: "Solve <span class=\"m\">" + A.disp(src) + "</span>.", keys: ["−"], placeholder: "e.g. x = 4", check: (s) => { const m = /(-?\d+(?:\.\d+)?)\s*$/.exec(s.replace(/−/g, "-")); return !!m && Math.abs(+m[1] - x0) < 1e-9; }, explain: "x = " + A.fmt(x0) + ".", hint: "Undo the " + sg(b) + " first, then divide by " + a + "." }; },
    pair() { const x0 = nz(-5, 7), y0 = nz(-5, 7), a = nz(1, 4), b = nz(1, 4), c = nz(1, 4), d = -nz(1, 4); if (a * d - b * c === 0) return kinds.pair();
      const e1 = A.polyStr(new Map([["x1", a], ["y1", b]])) + " = " + A.fmt(a * x0 + b * y0), e2 = A.polyStr(new Map([["x1", c], ["y1", d]])) + " = " + A.fmt(c * x0 + d * y0);
      return { q: "Solve:<br><span class=\"m\">" + e1 + "</span><br><span class=\"m\">" + e2 + "</span>", keys: ["x", "y", "=", ",", "−"], placeholder: "e.g. x = 3, y = 1", check: (s) => { const p = A.parsePair(s); return !!p && Math.abs(p.x - x0) < 1e-9 && Math.abs(p.y - y0) < 1e-9; }, explain: "Solution: x = " + A.fmt(x0) + ", y = " + A.fmt(y0) + ".", hint: "Eliminate one letter, solve, then substitute." }; }
  };
  const sets = { rev1: ["expand", "indices", "solve"], rev2: ["factorise", "solve", "indices"], rev3: ["pair", "expand", "factorise"] };
  Object.keys(sets).forEach((k) => M.registerPractice(k, () => kinds[P(sets[k])]()));
  M.mountAll();
})();
