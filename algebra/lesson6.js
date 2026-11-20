(function () {
  "use strict";
  const { $, say, chips } = A.ui, R = M.rnd, P = M.pick;
  const KEYS = ["x", "y", "^", "×", "÷"], ps = (p) => A.polyStr(p);
  const unkey = (k) => { const m = {}; (k.match(/[a-zA-Zπ]-?\d+/g) || []).forEach((t) => { m[t[0]] = +t.slice(1); }); return m; };
  const mono = (p) => { if (p.size !== 1) return null; const [k, c] = Array.from(p)[0]; return { c, m: unkey(k) }; };
  const vs = (a, b) => Array.from(new Set(Object.keys(a).concat(Object.keys(b)))).sort();
  const pw = (v, e) => v + (e === 1 ? "" : A.sup(e));

  function ixUI() {
    const out = $("ix-out"), n = A.tryParse($("ix-in").value); if (!n) return say(out, ["Type something like 3x^4 × 5x, 10x^3 ÷ 2x^2 or (x^6)^2."]);
    let whole; try { whole = A.poly(n); } catch (e) { return say(out, ["Use single terms (no + or −) with × ÷ and powers."]); }
    const lines = []; let top = n; while (top.t === "paren") top = top.a;
    if (top.t === "bin" && (top.op === "*" || top.op === "/")) {
      let a, b; try { a = mono(A.poly(top.a)); b = mono(A.poly(top.b)); } catch (e) { a = null; }
      if (!a || !b) return say(out, ["Use single terms, like 3x⁴ and 5x."]);
      const mul = top.op === "*";
      lines.push((mul ? "Multiply" : "Divide") + " the numbers: " + A.fmt(a.c) + (mul ? " × " : " ÷ ") + A.fmt(b.c) + " = " + A.fmt(mul ? a.c * b.c : a.c / b.c));
      vs(a.m, b.m).forEach((v) => { const e1 = a.m[v] || 0, e2 = b.m[v] || 0; lines.push((mul ? "Add" : "Subtract") + " the powers of " + v + ": " + pw(v, e1) + (mul ? " × " : " ÷ ") + pw(v, e2) + " = " + v + A.sup(mul ? e1 + e2 : e1 - e2) + (e1 === 1 || e2 === 1 ? "   (x on its own has index 1)".replace("x", v) : "")); });
    } else if (top.t === "pow") {
      const b = mono(A.poly(top.a)), e = A.evalNode(top.b, {});
      if (b) { lines.push("Power of a power: raise the number to the power " + e + " and multiply each index by " + e + "."); if (b.c !== 1) lines.push("Number: " + A.fmt(b.c) + A.sup(e) + " = " + A.fmt(Math.pow(b.c, e))); Object.keys(b.m).sort().forEach((v) => lines.push("Index of " + v + ": " + b.m[v] + " × " + e + " = " + b.m[v] * e)); }
    }
    lines.push("Answer: " + ps(whole)); say(out, lines);
  }
  chips($("ix-ch"), ["3x^4 × 5x", "10x^3 ÷ 2x^2", "(x^6)^2", "(2x^3)^2", "x^3 × x^2", "12x^5y^2 ÷ 3x^2y"], (e) => { $("ix-in").value = e; ixUI(); });
  $("ix-in").addEventListener("input", ixUI);

  const hint = (p, msg) => (s) => { const r = A.checkExpanded(s, p); return r.why === "brackets" ? "Write the answer without brackets." : r.why === "wrong" ? msg : "Type it like 15x^5 (use ^ for the power)."; };
  const mk = (src, msg) => { const p = A.poly(src); return { q: "Simplify <span class=\"m\">" + A.disp(src.replace(/\//g, "÷").replace(/\*/g, "×")).replace(/\//g, " ÷ ") + "</span>.", keys: ["x", "y", "^", "²", "³", "(", ")"], placeholder: "e.g. 15x^5", check: (s) => A.checkExpanded(s, p).ok, explain: A.disp(src.replace(/\//g, " ÷ ")) + " = " + ps(p) + ".", hint: hint(p, msg) }; };
  const co = () => R(2, 9);
  M.registerPractice("idx1", () => { const a = R(2, 8), b = R(2, 8), v = P(["x", "y", "a", "n"]); return mk(v + "^" + a + "*" + v + "^" + b, "When you multiply powers of the same letter, add the indices."); });
  M.registerPractice("idx2", () => { const b = R(2, 5), a = b + R(1, 5), v = P(["x", "y", "a", "n"]); return mk(v + "^" + a + "/" + v + "^" + b, "When you divide powers of the same letter, subtract the indices."); });
  M.registerPractice("idx3", () => { const k = R(0, 3); if (k < 2) { const a = co(), b = co(), m = R(2, 6), n = R(1, 5); return mk(a + "x^" + m + "*" + b + "x" + (n === 1 ? "" : "^" + n), "Multiply the numbers, and add the indices of x. Remember x on its own is x¹."); }
    const q = co(), a = q * R(2, 5), n = R(1, 4), m = n + R(1, 4); return mk(a + "x^" + m + "/" + q + "x" + (n === 1 ? "" : "^" + n), "Divide the numbers, and subtract the indices of x."); });
  M.registerPractice("idx4", () => { const k = R(0, 2), m = R(2, 5), n = R(2, 4);
    if (k === 0) return mk("(x^" + m + ")^" + n, "A power of a power: multiply the indices.");
    if (k === 1) return mk("(" + R(2, 4) + "x^" + m + ")^" + R(2, 3), "Raise the number to the power too, and multiply the index of x by the outside power.");
    return mk("(" + R(2, 3) + "x^" + m + "y)^" + R(2, 3), "Everything inside the bracket gets the power: the number, x and y."); });
  ixUI(); M.mountAll();
})();
