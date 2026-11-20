(function () {
  "use strict";
  const { $, say, chips } = A.ui, R = M.rnd, P = M.pick, MINUS = A.MINUS;
  const eqS = (a, b, c) => A.polyStr(new Map([...(a ? [["x1", a]] : []), ...(b ? [["y1", b]] : [])])) + " = " + A.fmt(c);
  function spUI() {
    const out = $("sp-out"), r = A.solvePair($("sp-a").value, $("sp-b").value);
    if (r.error) return say(out, [r.error]);
    const lines = r.steps.map((s, i) => (i < 2 ? "" : "→ ") + s.note + ":   " + s.eq);
    lines.push("Solution: x = " + A.fmt(r.x) + ", y = " + A.fmt(r.y));
    const e1 = A.coeffs($("sp-a").value), e2 = A.coeffs($("sp-b").value);
    lines.push("Check: " + A.fmt(e1.x * r.x + e1.y * r.y) + " = " + A.fmt(e1.c) + " and " + A.fmt(e2.x * r.x + e2.y * r.y) + " = " + A.fmt(e2.c) + "  ✓");
    say(out, lines);
  }
  chips($("sp-ch"), [["2x + y = 7", "x − y = 2"], ["3x + 2y = 12", "x + y = 5"], ["2x + 3y = 13", "3x − 2y = 0"], ["x + y = 10", "x − y = 4"]].map((p) => ({ label: p[0] + " ; " + p[1], p })), (it) => { $("sp-a").value = it.p[0]; $("sp-b").value = it.p[1]; spUI(); });
  ["sp-a", "sp-b"].forEach((id) => $(id).addEventListener("input", spUI)); spUI();

  const nz = (lo, hi) => { let v; do { v = R(lo, hi); } while (v === 0); return v; };
  const mk = (e1, e2, x0, y0) => ({ q: "Solve the simultaneous equations:<br><span class=\"m\">" + eqS(...e1) + "</span><br><span class=\"m\">" + eqS(...e2) + "</span>", keys: ["x", "y", "=", ",", "−"], placeholder: "e.g. x = 3, y = 1",
    check: (s) => { const p = A.parsePair(s); return !!p && Math.abs(p.x - x0) < 1e-9 && Math.abs(p.y - y0) < 1e-9; },
    explain: "Solution: x = " + A.fmt(x0) + ", y = " + A.fmt(y0) + ".", hint: (s) => { const p = A.parsePair(s); if (!p) return "Give both answers like x = 3, y = 1."; if (Math.abs(p.x - x0) < 1e-9) return "x is right. Now put it into an equation to find y."; if (Math.abs(p.y - y0) < 1e-9) return "y is right. Now put it into an equation to find x."; return "Eliminate one letter, solve, then substitute. Check your answer in both equations."; } });
  const cf = (a, b, x0, y0) => [a, b, a * x0 + b * y0];
  const gen = (kind) => { for (let t = 0; t < 100; t++) { const x0 = nz(-6, 8), y0 = nz(-6, 8); let e1, e2;
    if (kind === 1) { const a = nz(1, 5), b = nz(1, 5), c = nz(1, 5) * P([1, -1]), sgn = P([1, -1]); if (c === a) continue; e1 = cf(a, b, x0, y0); e2 = cf(c, sgn * b, x0, y0); if (A.coeffs(eqS(...e1)) && Math.abs(e1[0] * e2[1] - e1[1] * e2[0]) < 1e-9) continue; }
    else if (kind === 2) { const a = nz(1, 4), b = nz(1, 3), c = nz(1, 4), k = P([2, 3]); e1 = cf(a, b, x0, y0); e2 = cf(c, k * b * P([1, -1]), x0, y0); }
    else { const a = nz(2, 5), b = nz(2, 5), c = nz(2, 5), d = nz(2, 5) * P([1, -1]); e1 = cf(a, b, x0, y0); e2 = cf(c, d, x0, y0); if (Math.abs(a) === Math.abs(c) || Math.abs(b) === Math.abs(d)) continue; }
    if (Math.abs(e1[0] * e2[1] - e1[1] * e2[0]) < 1e-9) continue; if (Math.abs(e1[2]) > 60 || Math.abs(e2[2]) > 60) continue; return mk(e1, e2, x0, y0); } return mk([1, 1, 5], [1, -1, 1], 3, 2); };
  M.registerPractice("sim1", () => gen(1)); M.registerPractice("sim2", () => gen(2)); M.registerPractice("sim3", () => gen(3));
  M.mountAll();
})();
