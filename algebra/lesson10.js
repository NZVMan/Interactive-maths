(function () {
  "use strict";
  const { $, say, chips } = A.ui, R = M.rnd, P = M.pick, MINUS = A.MINUS;
  const num = (s) => M.parseNumber(String(s).trim().replace(/^[a-z]\s*=\s*/i, "").replace(/\s+/g, ""));
  function svUI() {
    const src = $("sv-in").value, r = A.solveLinear(src), out = $("sv-out");
    if (r.error) return say(out, [r.error]);
    const lines = r.steps.map((s, i) => (i ? "→ " : "") + s.note + (s.eq ? ":   " + s.eq : "")); lines.push("Answer: " + r.answer.replace(/-/g, MINUS));
    const p = src.split("="); try { const L = A.evalNode(A.parse(p[0]), { [r.v]: r.value }), Rr = A.evalNode(A.parse(p[1]), { [r.v]: r.value }); lines.push("Check: left = " + A.fmt(L) + ", right = " + A.fmt(Rr) + (Math.abs(L - Rr) < 1e-9 ? "  ✓" : "")); } catch (e) {}
    say(out, lines);
  }
  chips($("sv-ch"), ["5x − 4 = 2x + 11", "2x + 3 = 5x − 9", "2(x + 3) = x + 10", "3(x − 2) = 2(x + 1)", "4 − x = 2x + 10", "7x + 1 = 3x + 1"], (e) => { $("sv-in").value = e; svUI(); });
  $("sv-in").addEventListener("input", svUI); svUI();
  const sg = (n) => (n < 0 ? "-" : "+") + Math.abs(n);
  const mk = (src, x0, hint) => { const r = A.solveLinear(src); if (!r.ok || Math.abs(r.value - x0) > 1e-9) throw new Error("bad equation " + src);
    return { q: "Solve <span class=\"m\">" + A.disp(src) + "</span>.", keys: ["−"], placeholder: "e.g. x = 4", check: (s) => Math.abs(num(s) - x0) < 1e-9, explain: r.steps.slice(1).map((x) => x.eq).filter(Boolean).join(", ").replace(/\s+/g, " ") + ".", hint }; };
  const pickXc = () => { let a, c; do { a = R(2, 9); c = R(1, 8); } while (a === c); return [a, c]; };
  M.registerPractice("eq4", () => { const x0 = R(-6, 9) || 3, [a, c] = pickXc(), b = R(-9, 9) || 4, d = a * x0 + b - c * x0;
    return mk(a + "x" + sg(b) + "=" + c + "x" + sg(d), x0, "Subtract the smaller x term from both sides, then undo the number, then divide."); });
  M.registerPractice("eq5", () => { const x0 = R(-5, 8) || 2, a = R(2, 6), b = R(1, 7), k = R(0, 1);
    if (k === 0) return mk(a + "(x+" + b + ")=" + a * (x0 + b), x0, "Expand the bracket first: multiply both x and " + b + " by " + a + ".");
    let c = R(1, a - 1 || 1); if (a === 1) c = 1; const d = a * x0 + a * b - c * x0; return mk(a + "(x+" + b + ")=" + (c === 1 ? "" : c) + "x" + sg(d), x0, "Expand the bracket, then collect the x terms on one side."); });
  M.registerPractice("eq6", () => { const x0 = R(-6, 8) || 3, k = R(0, 2); let a, c;
    do { a = R(2, 6); c = R(2, 6); } while (a === c);
    const b = R(1, 6), d = R(1, 6);
    if (k === 0) { const e = a * (x0 + b) - c * (x0 + d); return mk(a + "(x+" + b + ")=" + c + "(x+" + d + ")" + (e ? sg(e) : ""), x0, "Expand both brackets, collect the x terms on one side, then solve."); }
    if (k === 1) { const e = a * x0 + b - c * (x0 + d); return mk(a + "x+" + b + "=" + c + "(x+" + d + ")" + (e ? sg(e) : ""), x0, "Expand the bracket, collect the x terms, then solve."); }
    const f = b + 10, g = f - a * x0 - c * x0; return mk(f + "-" + a + "x=" + c + "x" + (g ? sg(g) : ""), x0, "Collect the x terms on the side where the coefficient is positive, then solve."); });
  M.mountAll();
})();
