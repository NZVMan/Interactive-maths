(function () {
  "use strict";
  const { $, say, chips } = A.ui, R = M.rnd, P = M.pick, MINUS = A.MINUS;
  const KEYS = ["x", "²", "(", ")", "−"], ps = (p) => A.polyStr(p);
  function dbUI() {
    const out = $("db-out"), tab = $("db-tab"); tab.textContent = "";
    const n = A.tryParse($("db-in").value);
    if (!n || n.t !== "bin" || n.op !== "*" || n.a.t !== "paren" || n.b.t !== "paren") return say(out, ["Type two brackets next to each other, like (x + 4)(x − 7)."]);
    const T1 = A.terms(n.a.a), T2 = A.terms(n.b.a); if (T1.length > 3 || T2.length > 3) return say(out, ["Use at most three terms in each bracket."]);
    let tot = new Map(), ok = true;
    const head = tab.createTHead().insertRow(); head.appendChild(document.createElement("th")).textContent = "×";
    T2.forEach((t) => { head.appendChild(document.createElement("th")).textContent = ps(A.poly(t)); });
    const body = tab.createTBody();
    T1.forEach((a) => { const row = body.insertRow(), th = document.createElement("th"); th.textContent = ps(A.poly(a)); row.appendChild(th); T2.forEach((b) => { const pr = A.pmul(A.poly(a), A.poly(b)); tot = A.padd(tot, pr); row.insertCell().textContent = ps(pr); }); });
    say(out, ["Add all the cells: " + T1.flatMap((a) => T2.map((b) => ps(A.pmul(A.poly(a), A.poly(b))))).join(" , "), "Collect like terms: " + ps(tot)]);
  }
  chips($("db-ch"), ["(x + 4)(x − 7)", "(x + 3)(x + 2)", "(2x + 3)(x − 5)", "(x + 3)(x + 3)", "(x − 5)(x + 5)"], (e) => { $("db-in").value = e; dbUI(); });
  $("db-in").addEventListener("input", dbUI);

  const hint = (p) => (s) => { const r = A.checkExpanded(s, p); return r.why === "brackets" ? "Multiply out the brackets so none are left." : r.why === "collect" ? "Collect the like terms (the two x terms)." : "Multiply every term in the first bracket by every term in the second, then collect like terms. Watch the signs."; };
  const mk = (src, kind) => { const p = A.poly(src); return { q: "Expand and simplify <span class=\"m\">" + A.disp(src) + "</span>.", keys: KEYS, placeholder: "e.g. x² + 5x + 6", check: (s) => A.checkExpanded(s, p).ok, explain: A.disp(src) + " = " + ps(p) + ".", hint: hint(p) }; };
  const sg = (n) => (n < 0 ? "-" : "+") + Math.abs(n);
  M.registerPractice("dbl1", () => { const a = R(-9, 9) || 4, b = R(-9, 9) || 5; return mk("(x" + sg(a) + ")(x" + sg(b) + ")"); });
  M.registerPractice("dbl2", () => { const a = R(2, 4), b = R(-6, 6) || 3, c = R(1, 3), d = R(-6, 6) || 2; return mk("(" + a + "x" + sg(b) + ")(" + (c === 1 ? "" : c) + "x" + sg(d) + ")"); });
  M.registerPractice("dbl3", () => { const a = R(2, 9), k = R(0, 2); return mk(k === 0 ? "(x+" + a + ")^2" : k === 1 ? "(x-" + a + ")^2" : "(x+" + a + ")(x-" + a + ")"); });
  dbUI(); M.mountAll();
})();
