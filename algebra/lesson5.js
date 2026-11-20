(function () {
  "use strict";
  const { $, say } = A.ui, R = M.rnd, P = M.pick, MINUS = A.MINUS;
  const KEYS = ["x", "²", "(", ")", "−"], num = (s) => M.parseNumber(String(s).replace(/\s+/g, ""));
  const lin = (p, q) => A.polyStr(new Map([["x1", p], ["", q]]));
  function factorQuad(a, b, c) {
    if (a === 0) return null;
    const divs = (n) => { const d = []; for (let i = 1; i <= Math.abs(n); i++) if (n % i === 0) d.push(i, -i); return d; };
    for (const p of divs(a)) for (const q of divs(c || 1)) { const r = a / p, s = (c === 0 ? 0 : c / q); if (p * s + q * r === b && (c !== 0 || q === 0)) return [[p, q], [r, s]]; }
    return null;
  }
  const norm = (f) => { let [[p, q], [r, s]] = f; if (p < 0 && r < 0) { p = -p; q = -q; r = -r; s = -s; } return [[p, q], [r, s]]; };
  const fstr = (f) => "(" + lin(f[0][0], f[0][1]) + ")(" + lin(f[1][0], f[1][1]) + ")";
  function fqUI() {
    const out = $("fq-out"), tab = $("fq-tab"); tab.textContent = "";
    const a = num($("fq-a").value), b = num($("fq-b").value), c = num($("fq-c").value);
    if (![a, b, c].every(Number.isInteger) || a === 0 || Math.abs(a * c) > 400) return say(out, ["Use whole numbers (a can't be 0, and a × c up to 400)."]);
    const ac = a * c, pairs = [];
    if (ac === 0) return say(out, ["c is 0, so just take out x: " + A.polyStr(new Map([["x2", a], ["x1", b]])) + " = x(" + lin(a, b) + ")"]);
    for (let m = -Math.abs(ac); m <= Math.abs(ac); m++) if (m !== 0 && ac % m === 0 && m <= ac / m) pairs.push([m, ac / m]);
    const head = tab.createTHead().insertRow(); ["Number 1", "Number 2", "Product", "Sum"].forEach((h) => { head.appendChild(document.createElement("th")).textContent = h; });
    const body = tab.createTBody(); let found = null;
    pairs.forEach(([m, n]) => { const row = body.insertRow(), hit = m + n === b; if (hit && !found) found = [m, n];
      [A.fmt(m), A.fmt(n), A.fmt(ac), A.fmt(m + n) + (hit ? "  ✓" : "")].forEach((t) => { row.insertCell().textContent = t; }); if (hit) row.style.fontWeight = "700"; });
    const lines = ["Numbers that multiply to a × c = " + A.fmt(ac) + " and add to b = " + A.fmt(b) + ":"];
    if (!found) { lines.push("None of the pairs add to " + A.fmt(b) + ", so this does not factorise with whole numbers."); return say(out, lines); }
    lines[0] += " " + A.fmt(found[0]) + " and " + A.fmt(found[1]);
    const f = factorQuad(a, b, c);
    if (a !== 1) lines.push("Split the middle term: " + A.polyStr(new Map([["x2", a], ["x1", found[0]]])) + " + " + A.polyStr(new Map([["x1", found[1]], ["", c]])).replace(/^−/, "− ").replace(/ \+ −/, " − ") + ", then factorise in pairs.");
    if (f) lines.push("Answer: " + fstr(norm(f)));
    say(out, lines);
  }
  ["fq-a", "fq-b", "fq-c"].forEach((id) => $(id).addEventListener("input", fqUI));

  const hint = (t, n) => (s) => { const r = A.checkFactorised(s, t, n); return r.why === "notfactorised" ? "Write the answer as two brackets multiplied together." : r.why === "wrong" ? "Expand your brackets to check. They should give back the starting expression." : r.why === "notfully" ? "Check each bracket: is there a common factor you can take out?" : "Type it like (x + 2)(x + 3)."; };
  const nz = (lo, hi) => { let v; do { v = R(lo, hi); } while (v === 0); return v; };
  const sg = (n) => (n < 0 ? "-" : "+") + Math.abs(n);
  const mk = (src, n, ansTxt) => { const t = A.poly(src); return { q: "Factorise <span class=\"m\">" + A.polyStr(t) + "</span> fully.", keys: KEYS, placeholder: "e.g. (x + 2)(x + 3)", check: (s) => A.checkFactorised(s, t, n).ok, explain: A.polyStr(t) + " = " + (ansTxt || A.disp(src)) + ".", hint: hint(t, n) }; };
  M.registerPractice("fq1", () => { const p = nz(-9, 9), q = P([nz(-9, 9), -p]); return mk("(x" + sg(p) + ")(x" + sg(q) + ")", 2); });
  M.registerPractice("fq2", () => { let a, r, q, s; do { a = R(2, 4); r = P([1, 1, 2, 3]); q = nz(-6, 6); s = nz(-6, 6); } while (A.gcd(a, q) !== 1 || A.gcd(r, s) !== 1); return mk("(" + a + "x" + sg(q) + ")(" + (r === 1 ? "" : r) + "x" + sg(s) + ")", 2); });
  M.registerPractice("fq3", () => { const g = R(2, 5), p = nz(-6, 6), q = nz(-6, 6); return mk(g + "(x" + sg(p) + ")(x" + sg(q) + ")", 2); });
  fqUI(); M.mountAll();
})();
