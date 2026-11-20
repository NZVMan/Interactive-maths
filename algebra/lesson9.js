(function () {
  "use strict";
  const { $, say, chips } = A.ui, R = M.rnd, P = M.pick, MINUS = A.MINUS;
  const num = (s) => { const t = String(s).trim().replace(/^[a-z]\s*=\s*/i, ""); return M.parseNumber(t.replace(/\s+/g, "")); };
  function show(out, r, src) {
    if (r.error) return say(out, [r.error]);
    const lines = r.steps.map((s, i) => (i === 0 ? "" : "→ ") + s.note + (s.eq ? ":   " + s.eq : ""));
    lines.push("Answer: " + r.answer.replace(/-/g, MINUS));
    const parts = String(src).split("="); try { const L = A.evalNode(A.parse(parts[0]), { [r.v]: r.value }), Rr = A.evalNode(A.parse(parts[1]), { [r.v]: r.value }); lines.push("Check: left = " + A.fmt(L) + ", right = " + A.fmt(Rr) + (Math.abs(L - Rr) < 1e-9 ? "  ✓" : "")); } catch (e) {}
    say(out, lines);
  }
  function svUI() { const src = $("sv-in").value; show($("sv-out"), A.solveLinear(src), src); }
  chips($("sv-ch"), ["3x + 5 = 20", "x + 7 = 12", "4x = 28", "x/4 + 3 = 9", "7 − 2x = 1", "2x − 9 = −3"], (e) => { $("sv-in").value = e; svUI(); });
  $("sv-in").addEventListener("input", svUI); svUI();

  const mk = (src, x0, hint) => { const r = A.solveLinear(src); return { q: "Solve <span class=\"m\">" + A.disp(src) + "</span>.", keys: ["−"], placeholder: "e.g. x = 4", check: (s) => Math.abs(num(s) - x0) < 1e-9, explain: r.steps.slice(1).map((x) => x.eq).filter(Boolean).join(", ").replace(/\s+/g, " ") + ".", hint: (s) => (Math.abs(num(s) + x0) < 1e-9 && x0 !== 0 ? "Check the sign of your answer." : hint) }; };
  const sg = (n) => (n < 0 ? "-" : "+") + Math.abs(n);
  M.registerPractice("eq1", () => { const x0 = R(-9, 12) || 5, b = R(2, 12), a = R(2, 9), k = R(0, 3);
    if (k === 0) return mk("x+" + b + "=" + (x0 + b), x0, "Subtract " + b + " from both sides.");
    if (k === 1) return mk("x-" + b + "=" + (x0 - b), x0, "Add " + b + " to both sides.");
    if (k === 2) return mk(a + "x=" + a * x0, x0, "Divide both sides by " + a + ".");
    return mk("x/" + a + "=" + x0, a * x0, "Multiply both sides by " + a + "."); });
  M.registerPractice("eq2", () => { const x0 = R(-8, 10) || 3, a = R(2, 9), b = R(-12, 12) || 5, k = R(0, 1);
    if (k === 0) return mk(a + "x" + sg(b) + "=" + (a * x0 + b), x0, "Undo the " + (b > 0 ? "+" : "−") + " " + Math.abs(b) + " first, then divide by " + a + ".");
    return mk(b + "+" + a + "x=" + (a * x0 + b), x0, "Subtract " + b + " from both sides first, then divide by " + a + "."); });
  M.registerPractice("eq3", () => { const x0 = R(-6, 9) || 4, a = R(2, 6), b = R(1, 9), k = R(0, 2);
    if (k === 0) { const y = a * x0; return mk("x/" + a + "+" + b + "=" + (x0 + b), y, "Subtract " + b + ", then multiply both sides by " + a + "."); }
    if (k === 1) return mk(b + "-" + a + "x=" + (b - a * x0), x0, "Subtract " + b + " from both sides to get −" + a + "x, then divide by −" + a + ".");
    return mk("x/" + a + "-" + b + "=" + (x0 - b), a * x0, "Add " + b + " to both sides, then multiply both sides by " + a + "."); });
  M.mountAll();
})();
