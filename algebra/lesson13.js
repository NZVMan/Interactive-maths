(function () {
  "use strict";
  const { $, say, chips } = A.ui, R = M.rnd, P = M.pick, NS = "http://www.w3.org/2000/svg";
  const el = (n, at, txt) => { const e = document.createElementNS(NS, n); for (const k in at) e.setAttribute(k, at[k]); if (txt != null) e.textContent = txt; return e; };
  function draw(e1, e2, r) {
    const box = $("gr-svg"); box.textContent = "";
    const W = 320, H = 260, L = 10, s = Math.max(Math.abs(r.x), Math.abs(r.y), 4) + 2, u = (W - 2 * L) / (2 * s), uy = (H - 2 * L) / (2 * s);
    const X = (v) => W / 2 + v * u, Y = (v) => H / 2 - v * uy;
    const svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "Graph of the two lines crossing at (" + A.fmt(r.x) + ", " + A.fmt(r.y) + ")", style: "width:100%;max-width:360px;height:auto" });
    svg.appendChild(el("line", { x1: 0, y1: H / 2, x2: W, y2: H / 2, stroke: "currentColor", "stroke-opacity": .5 }));
    svg.appendChild(el("line", { x1: W / 2, y1: 0, x2: W / 2, y2: H, stroke: "currentColor", "stroke-opacity": .5 }));
    [[e1, "#2b6cb0"], [e2, "#c05621"]].forEach(([e, col]) => {
      let a, b;
      if (Math.abs(e.y) > 1e-9) { a = [-s, (e.c - e.x * -s) / e.y]; b = [s, (e.c - e.x * s) / e.y]; } else { a = [e.c / e.x, -s]; b = [e.c / e.x, s]; }
      svg.appendChild(el("line", { x1: X(a[0]), y1: Y(a[1]), x2: X(b[0]), y2: Y(b[1]), stroke: col, "stroke-width": 2.5 }));
    });
    svg.appendChild(el("circle", { cx: X(r.x), cy: Y(r.y), r: 5, fill: "currentColor" }));
    svg.appendChild(el("text", { x: Math.min(X(r.x) + 8, W - 70), y: Math.max(Y(r.y) - 8, 14), "font-size": 13, fill: "currentColor" }, "(" + A.fmt(r.x) + ", " + A.fmt(r.y) + ")"));
    box.appendChild(svg);
  }
  function grUI() {
    const out = $("gr-out"), r = A.solvePair($("gr-a").value, $("gr-b").value);
    if (r.error) { $("gr-svg").textContent = ""; return say(out, [r.error]); }
    draw(A.coeffs($("gr-a").value), A.coeffs($("gr-b").value), r);
    say(out, ["The lines cross at (" + A.fmt(r.x) + ", " + A.fmt(r.y) + ").", "So x = " + A.fmt(r.x) + " and y = " + A.fmt(r.y) + "."]);
  }
  chips($("gr-ch"), [["x + y = 6", "x − y = 2"], ["y = 2x − 1", "3x + y = 9"], ["2x + y = 8", "x − y = 1"]].map((p) => ({ label: p[0] + " ; " + p[1], p })), (it) => { $("gr-a").value = it.p[0]; $("gr-b").value = it.p[1]; grUI(); });
  ["gr-a", "gr-b"].forEach((id) => $(id).addEventListener("input", grUI)); grUI();

  const nz = (lo, hi) => { let v; do { v = R(lo, hi); } while (v === 0); return v; };
  const pair = (x0, y0, q, explain) => ({ q, keys: ["x", "y", "=", ",", "−"], placeholder: "e.g. x = 3, y = 1",
    check: (s) => { const p = A.parsePair(s); return !!p && Math.abs(p.x - x0) < 1e-9 && Math.abs(p.y - y0) < 1e-9; }, explain,
    hint: (s) => { const p = A.parsePair(s); if (!p) return "Give both answers like x = 3, y = 1."; if (Math.abs(p.x - x0) < 1e-9) return "x is right. Now find y."; if (Math.abs(p.y - y0) < 1e-9) return "y is right. Now find x."; return "Substitute, solve for one letter, then find the other. Check in both equations."; } });
  M.registerPractice("sub1", () => { let x0, y0, m, c, a, b; do { x0 = nz(-5, 6); y0 = nz(-5, 6); m = nz(-3, 3); c = y0 - m * x0; a = nz(1, 4); b = P([1, -1]); } while (Math.abs(c) > 12 || m === 0 || a + b * m === 0);
    const e1 = "y = " + A.polyStr(new Map([["x1", m], ["", c]])), e2 = A.polyStr(new Map([["x1", a], ["y1", b]])) + " = " + A.fmt(a * x0 + b * y0);
    return pair(x0, y0, "Solve by substitution:<br><span class=\"m\">" + e1 + "</span><br><span class=\"m\">" + e2 + "</span>", "Solution: x = " + A.fmt(x0) + ", y = " + A.fmt(y0) + "."); });
  M.registerPractice("word1", () => { let a, b, n1, n2, m1, m2; do { a = R(1, 5); b = R(2, 9); n1 = R(1, 5); m1 = R(1, 4); n2 = R(1, 5); m2 = R(1, 4); } while (n1 * m2 === n2 * m1 || a === b);
    const it = P([["pen", "book"], ["muffin", "juice"], ["ruler", "folder"]]);
    return pair(a, b, "Let x be the cost of one " + it[0] + " and y the cost of one " + it[1] + " (in dollars). " + n1 + " " + it[0] + "s and " + m1 + " " + it[1] + "s cost $" + (n1 * a + m1 * b) + ". " + n2 + " " + it[0] + "s and " + m2 + " " + it[1] + "s cost $" + (n2 * a + m2 * b) + ". Find x and y.", "Equations: " + n1 + "x + " + m1 + "y = " + (n1 * a + m1 * b) + " and " + n2 + "x + " + m2 + "y = " + (n2 * a + m2 * b) + ". Solution: x = " + a + ", y = " + b + "."); });
  M.registerPractice("word2", () => { const x0 = R(8, 30), y0 = R(1, x0 - 2);
    return pair(x0, y0, "Two numbers x and y add up to " + (x0 + y0) + ". Their difference (x − y) is " + (x0 - y0) + ". Find x and y.", "Equations: x + y = " + (x0 + y0) + " and x − y = " + (x0 - y0) + ". Solution: x = " + x0 + ", y = " + y0 + "."); });
  M.mountAll();
})();
