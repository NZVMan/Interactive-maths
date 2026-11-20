(function () {
  "use strict";
  const { $, say } = A.ui, R = M.rnd, P = M.pick;
  const numAns = (s) => { const t = String(s).trim().replace(/−/g, "-"); const f = M.parseFracInput(t); if (f) return f[0] / f[1]; return M.parseNumber(t.replace(/\s+/g, "")); };
  const fr = (n, d) => { const [a, b] = M.simplify(n, d); return b === 1 ? String(a) : a + "/" + b; };
  const noNeg = (s) => !/\^\(?-|⁻/.test(String(s).replace(/\s+/g, "").replace(/−/g, "-"));
  const ps = (p) => A.polyStr(p);

  function trUI() {
    const out = $("tr-out"), a = A.tryParse($("tr-a").value), b = A.tryParse($("tr-b").value);
    if (!a || !b) return say(out, ["Type two expressions using x (and y if you like)."]);
    const lines = [];
    [[2, 3], [3, 2], [5, 4]].forEach(([x, y]) => { try { lines.push("x = " + x + ", y = " + y + ":  left = " + A.fmt(A.evalNode(a, { x, y })) + ",  right = " + A.fmt(A.evalNode(b, { x, y }))); } catch (e) {} });
    lines.push(A.equiv(a, b) ? "They match every time, so the rule looks TRUE." : "They don't match, so the statement is FALSE.");
    say(out, lines);
  }
  ["tr-a", "tr-b"].forEach((id) => $(id).addEventListener("input", trUI)); trUI();

  const co = () => R(2, 6);
  const mkExp = (src, msg) => { const p = A.poly(src); return { q: "Simplify <span class=\"m\">" + A.disp(src).replace(/\//g, " ÷ ") + "</span>.", keys: ["x", "y", "^", "(", ")", "²"], placeholder: "e.g. 4x^5", check: (s) => A.checkExpanded(s, p).ok, explain: A.disp(src).replace(/\//g, " ÷ ") + " = " + ps(p) + ".", hint: (s) => (A.checkExpanded(s, p).why === "brackets" ? "Write the answer without brackets." : msg) }; };
  M.registerPractice("mixa", () => { const k = R(0, 3), a = co(), b = co(), m = R(2, 4), n = R(2, 5);
    if (k === 0) return mkExp("(" + a + "x^" + m + ")^2/x", "Square everything in the bracket first (the number and x), then divide.");
    if (k === 1) return mkExp(a + "x^" + (m + n) + "*" + b + "x^" + n + "/x^" + m, "Multiply or divide left to right: add the indices for ×, subtract for ÷.");
    if (k === 2) { const q = co(); return mkExp(q * a + "x^" + (m + n) + "y^" + (m + 1) + "/" + q + "x^" + n + "y", "Divide the numbers, then subtract the indices of x and of y separately."); }
    return mkExp(a + "x^" + m + "*" + b + "y*x^" + n + "y^2", "Multiply the numbers; add the indices of x; add the indices of y."); });
  M.registerPractice("mixb", () => { const q = co(), a = q * R(1, 4), m = R(1, 3), n = m + R(1, 4), v = P(["x", "y"]);
    const d = n - m, c = a / q, src = a + v + "^" + m + "/" + q + v + "^" + n;
    const mid = (c === 1 ? "" : c) + v + A.sup(-d), fin = c + "/" + v + (d === 1 ? "" : A.sup(d));
    return { q: "Simplify <span class=\"m\">" + A.disp(a + v + "^" + m + "/" + q + v + "^" + n).replace(/\//g, " ÷ ") + "</span>. Give your answer with a positive index.", keys: ["x", "y", "/", "^"], placeholder: "e.g. 2/x^3", check: (s) => noNeg(s) && A.equiv(s, a + v + "^" + m + "/(" + q + v + "^" + n + ")"),
      explain: A.disp(src).replace(/\//g, " ÷ ") + " = " + mid + " = " + fin + ".", hint: (s) => (!noNeg(s) ? "Your answer still has a negative index. Write it as a fraction." : "Divide the numbers, subtract the indices (small − big gives a negative), then move the letter to the bottom.") }; });
  M.registerPractice("truefalse", () => { const m = R(2, 5), n = R(2, 5), bank = [
    ["x^" + m + " × x^" + n + " = x^" + (m + n), true, "Add the indices."], ["x^" + m + " × x^" + n + " = x^" + m * n, false, "Multiplying powers adds the indices: x^" + (m + n) + "."],
    ["(x^" + m + ")^" + n + " = x^" + (m + n), false, "A power of a power multiplies the indices: x^" + m * n + "."], ["(x^" + m + ")^" + n + " = x^" + m * n, true, "Multiply the indices."],
    ["x^" + (m + n) + " ÷ x^" + n + " = x^" + m, true, "Subtract the indices."], ["x^" + (m + n) + " ÷ x^" + n + " = x^" + (m + 1), false, "Subtract the indices: " + (m + n) + " − " + n + " = " + m + "."],
    ["x^0 = 0", false, "x⁰ = 1."], ["5x^0 = 5", true, "Only x is raised to 0, so 5 × 1 = 5."], ["2x^-1 = 1/(2x)", false, "Only x has the −1 index: 2x⁻¹ = 2/x."], ["x^-2 = 1/x^2", true, "A negative index means 1 over the positive power."], ["(2x)^2 = 2x^2", false, "Square the 2 too: (2x)² = 4x²."], ["(3x)^2 = 9x^2", true, "3² = 9."]];
    const [st, tv, why] = P(bank), d = (z) => A.disp(z.replace(/ ÷ /g, "÷")).replace(/÷/g, " ÷ ");
    return { q: "True or false? <span class=\"m\">" + d(st) + "</span>", choices: ["True", "False"], check: (s) => s.trim() === (tv ? "True" : "False"), explain: "The statement " + (tv ? "is true" : "is false") + ". " + why.replace(/\^(-?\d+)/g, (m0, n0) => A.sup(n0)), hint: "Test it with a number, such as x = 2." }; });
  M.registerPractice("evalidx", () => { const k = R(0, 2);
    if (k === 0) { const b = P([2, 3, 5]), m = R(2, 4), n = R(m + 1, 6), e = m - n, [N, D] = [1, Math.pow(b, n - m)]; return { q: "Work out <span class=\"m\">" + b + A.sup(m) + " × " + b + A.sup(-n) + "</span>. Give a fraction or decimal.", keys: ["/"], placeholder: "e.g. 1/9", check: (s) => Math.abs(numAns(s) - 1 / D) < 1e-9, explain: b + A.sup(m) + " × " + b + A.sup(-n) + " = " + b + A.sup(e) + " = 1/" + D + ".", hint: "Add the indices, then use a⁻ⁿ = 1/aⁿ." }; }
    if (k === 1) { const x = P([2, 3, 4]), c = R(2, 8), v = c / (x * x); return { q: "Find the value of <span class=\"m\">" + c + "x" + A.sup(-2) + "</span> when x = " + x + ". Give a fraction or decimal.", keys: ["/"], placeholder: "e.g. 3/4", check: (s) => Math.abs(numAns(s) - v) < 1e-9, explain: c + " × " + x + A.sup(-2) + " = " + c + "/" + x * x + " = " + fr(c, x * x) + ".", hint: "x⁻² = 1/x². Put the value in, then multiply by the number in front." }; }
    const b = P([2, 3, 4, 5]), m = R(2, 4); return { q: "Work out <span class=\"m\">(" + b + A.sup(m) + ")" + A.sup(0) + " + " + b + A.sup(-1) + "</span>. Give a fraction or decimal.", keys: ["/"], placeholder: "e.g. 6/5", check: (s) => Math.abs(numAns(s) - (1 + 1 / b)) < 1e-9, explain: "(" + b + A.sup(m) + ")⁰ + " + b + "⁻¹ = 1 + 1/" + b + " = " + fr(b + 1, b) + ".", hint: "Anything to the power 0 is 1, and 5⁻¹ means 1/5." }; });
  M.mountAll();
})();
