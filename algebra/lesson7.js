(function () {
  "use strict";
  const { $, say, chips } = A.ui, R = M.rnd, P = M.pick, MINUS = A.MINUS;
  const numAns = (s) => { const t = String(s).trim().replace(/−/g, "-"); const f = M.parseFracInput ? M.parseFracInput(t) : null; if (f) return f[0] / f[1]; const v = M.parseNumber(t.replace(/\s+/g, "")); return v; };
  const fr = (n, d) => { const [a, b] = M.simplify(n, d); return b === 1 ? String(a) : a + "/" + b; };
  const powFrac = (n, d, e) => { let N = 1, D = 1; const k = Math.abs(e); for (let i = 0; i < k; i++) { N *= n; D *= d; } return e < 0 ? [D, N] : [N, D]; };

  function ptUI() {
    const b = +$("pt-b").value, tab = $("pt-tab"); tab.textContent = "";
    const head = tab.createTHead().insertRow(); ["Power", "Value", "Pattern"].forEach((h) => { head.appendChild(document.createElement("th")).textContent = h; });
    const body = tab.createTBody();
    for (let e = 4; e >= -3; e--) { const [N, D] = powFrac(b, 1, e), row = body.insertRow(); row.insertCell().textContent = b + A.sup(e); row.insertCell().textContent = D === 1 ? String(N) : N + "/" + D; row.insertCell().textContent = e === 4 ? "" : "÷ " + b; if (e <= 0 && e >= -1) row.style.fontWeight = e === 0 ? "700" : "400"; }
  }
  $("pt-b").addEventListener("input", ptUI); ptUI();

  function ngUI() {
    const out = $("ng-out"), raw = A.normalise($("ng-in").value);
    let m = /^\(?(-?\d+)(?:\/(\d+))?\)?\^\(?(-?\d+)\)?$/.exec(raw);
    if (m) { const n = +m[1], d = m[2] ? +m[2] : 1, e = +m[3]; if (n === 0 || d === 0 || Math.abs(e) > 8 || Math.abs(n) > 99 || d > 99) return say(out, ["Use a base that isn't 0, and a small power."]);
      const lines = []; const base = d === 1 ? String(n) : "(" + n + "/" + d + ")";
      if (e === 0) return say(out, [base.replace(/-/g, MINUS) + "⁰ = 1   (anything except 0, to the power 0)"]);
      if (e < 0) lines.push(d === 1 ? base + A.sup(e) + " = 1/" + n + A.sup(-e) : base + A.sup(e) + " = (" + d + "/" + n + ")" + A.sup(-e) + "   (flip the fraction)");
      const [N, D] = powFrac(n, d, e); const [s1, s2] = M.simplify(N, D); lines.push("Value: " + (s2 === 1 ? s1 : s1 + "/" + s2) + (s2 !== 1 ? "  = " + A.fmt(s1 / s2) : ""));
      return say(out, lines.map((l) => l.replace(/-/g, MINUS))); }
    m = /^(\d*)([a-zA-Z])\^\(?(-?\d+)\)?$/.exec(raw);
    if (m) { const c = m[1] || "1", v = m[2], e = +m[3];
      if (e === 0) return say(out, [(c === "1" ? "" : c) + v + "⁰ = " + c + " × 1 = " + c, "Only the " + v + " goes to the power 0, so the coefficient stays."]);
      if (e < 0) return say(out, [(c === "1" ? "" : c) + v + A.sup(e) + " = " + c + " × 1/" + v + (e === -1 ? "" : A.sup(-e)) + " = " + c + "/" + v + (e === -1 ? "" : A.sup(-e)), "The negative index moves only the " + v + " to the bottom of the fraction."]);
      return say(out, [(c === "1" ? "" : c) + v + A.sup(e) + " already has a positive index."]); }
    say(out, ["Try 2^-3, (2/3)^-2, 5x^-1 or x^-2."]);
  }
  chips($("ng-ch"), ["2^-3", "5^0", "(2/3)^-2", "5x^-1", "x^-2", "10^-4"], (e) => { $("ng-in").value = e; ngUI(); });
  $("ng-in").addEventListener("input", ngUI); ngUI();

  const noNeg = (s) => !/\^\(?-|⁻/.test(String(s).replace(/\s+/g, "").replace(/−/g, "-"));
  M.registerPractice("zero", () => { const k = R(0, 2);
    if (k === 0) { const b = R(2, 20); return { q: "Work out <span class=\"m\">" + b + "⁰</span>.", placeholder: "a number", check: (s) => numAns(s) === 1, explain: b + "⁰ = 1.", hint: "Any number (except 0) to the power 0 is 1." }; }
    if (k === 1) { const a = R(2, 9), v = P(["x", "y", "n"]); return { q: "Simplify <span class=\"m\">" + a + v + "⁰</span>.", placeholder: "a number", check: (s) => numAns(s) === a, explain: a + v + "⁰ = " + a + " × 1 = " + a + ".", hint: "Only the letter has the power 0. So " + v + "⁰ = 1, and the " + a + " is left." }; }
    const a = R(2, 6), b = R(2, 6); return { q: "Work out <span class=\"m\">(" + a + "x)⁰ + " + b + "</span>.", placeholder: "a number", check: (s) => numAns(s) === 1 + b, explain: "(" + a + "x)⁰ + " + b + " = 1 + " + b + " = " + (1 + b) + ".", hint: "A bracket to the power 0 is 1." }; });
  M.registerPractice("negnum", () => { const b = P([2, 3, 4, 5, 10]), e = -R(1, 3), [N, D] = powFrac(b, 1, e), ans = N / D; const f = fr(N, D);
    return { q: "Work out <span class=\"m\">" + b + A.sup(e) + "</span>. Give it as a fraction (like 1/8) or a decimal.", keys: ["/"], placeholder: "e.g. 1/8", check: (s) => Math.abs(numAns(s) - ans) < 1e-9, explain: b + A.sup(e) + " = 1/" + b + A.sup(-e) + " = " + f + ".", hint: "A negative index means 1 over the positive power: a⁻ⁿ = 1/aⁿ. The answer is not negative." }; });
  M.registerPractice("negalg", () => { const k = R(0, 2), v = P(["x", "y", "a"]), e = R(1, 5), c = R(2, 9); let src, ans;
    if (k === 0) { src = v + "^-" + e; ans = "1/" + v + "^" + e; } else if (k === 1) { src = c + v + "^-" + e; ans = c + "/" + v + "^" + e; } else { src = "1/" + v + "^-" + e; ans = v + "^" + e; }
    return { q: "Write <span class=\"m\">" + A.disp(src).replace(/\//g, "/") + "</span> with a positive index.", keys: ["x", "/", "^"], placeholder: "e.g. 3/x^2", check: (s) => noNeg(s) && A.equiv(s, ans), explain: A.disp(src) + " = " + A.disp(ans) + ".", hint: (s) => (!noNeg(s) ? "Your answer still has a negative index." : "Remember: only the letter moves to the bottom. A number in front stays where it is.") }; });
  M.registerPractice("negfrac", () => { const p = R(1, 4), q = P([2, 3, 4, 5]), a = P([1, 2, 3].filter((x) => x !== q)), e = -R(1, 3);
    const [N, D] = powFrac(a, q, e), f = fr(N, D);
    return { q: "Work out <span class=\"m\">(" + a + "/" + q + ")" + A.sup(e) + "</span>.", keys: ["/"], placeholder: "e.g. 9/4", check: (s) => Math.abs(numAns(s) - N / D) < 1e-9, explain: "(" + a + "/" + q + ")" + A.sup(e) + " = (" + q + "/" + a + ")" + A.sup(-e) + " = " + f + ".", hint: "Flip the fraction, then use the positive index." }; });
  M.mountAll();
})();
