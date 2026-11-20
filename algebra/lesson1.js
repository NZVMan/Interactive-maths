(function () {
  "use strict";
  const { $, say, chips } = A.ui, R = M.rnd, P = M.pick;
  const num = (s) => M.parseNumber(String(s).replace(/\s+/g, ""));
  const KEYS = ["x", "y", "²", "(", ")", "−"];

  /* ---- like terms ---- */
  function ltUI() {
    const out = $("lt-out"), n = A.tryParse($("lt-in").value);
    if (!n) return say(out, ["I couldn't read that. Use numbers, letters, + and −, for example 3x + 2y − x + 4."]);
    let p; try { p = A.poly(n); } catch (e) { return say(out, ["Only + − × and powers work here."]); }
    const groups = new Map();
    A.terms(n).forEach((t) => { const q = A.poly(t), k = Array.from(q.keys())[0] === undefined ? "" : Array.from(q.keys())[0];
      const sign = t.t === "neg" ? -1 : 1; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(q); });
    const lines = [];
    groups.forEach((list, k) => {
      let tot = new Map(); list.forEach((q) => { tot = A.padd(tot, q); });
      const label = k === "" ? "numbers" : A.polyStr(new Map([[k, 1]])) + " terms";
      lines.push("Like terms (" + label + "): " + list.map((q, i) => { const s = A.polyStr(q); return i === 0 ? s : (s[0] === A.MINUS ? s.replace(A.MINUS, "− ") : "+ " + s); }).join(" ") + " = " + A.polyStr(tot));
    });
    lines.push("Simplified: " + A.polyStr(p));
    say(out, lines);
  }
  chips($("lt-ex"), ["3x + 2y + 5x − y + 4", "4a − 7 + 2a + 10", "x² + 3x − 2x² + x", "5ab + 2a − 3ab"], (e) => { $("lt-in").value = e; ltUI(); });
  $("lt-in").addEventListener("input", ltUI);

  /* ---- substitution ---- */
  function envFrom() { const x = num($("sb-x").value), y = num($("sb-y").value); return isNaN(x) || isNaN(y) ? null : { x, y }; }
  function sbUI() {
    const out = $("sb-out"), src = $("sb-e").value, n = A.tryParse(src), env = envFrom();
    if (!n || !env) return say(out, ["Type an expression with x and y (like 3x² − 2y + 1) and numbers for x and y."]);
    const used = A.varsOf(n); if ([...used].some((v) => v !== "x" && v !== "y")) return say(out, ["Use only the letters x and y."]);
    const sub = (v) => (env[v] < 0 ? "(" + A.fmt(env[v]) + ")" : A.fmt(env[v]));
    const text = A.normaliseForSub ? "" : src.replace(/[xy]/g, (c) => "§" + c);
    let shown = String(src).replace(/\s+/g, "").replace(/-/g, "−");
    shown = shown.replace(/([0-9)²³⁴])(?=[xy])/g, "$1×").replace(/([xy])(?=[xy(])/g, "$1×").replace(/[xy]/g, (c) => sub(c)).replace(/\)(?=\()/g, ")×");
    const lines = ["Substitute: " + shown.replace(/(?<=[\d)²³])([+−=])/g, " $1 ").replace(/×/g, " × ")];
    const calc = shown.replace(/²/g, "^2").replace(/³/g, "^3"), r = M.evalSteps(calc.replace(/−/g, "-"));
    if (!r.error) { r.steps.forEach((s) => lines.push(s.note + " → " + s.expr.replace(/\^2/g, "²").replace(/\^3/g, "³").replace(/-/g, "−"))); lines.push("Answer: " + A.fmt(r.result)); }
    else { try { lines.push("Answer: " + A.fmt(A.evalNode(n, env))); } catch (e) { lines.push("Check the expression."); } }
    say(out, lines);
  }
  ["sb-e", "sb-x", "sb-y"].forEach((id) => $(id).addEventListener("input", sbUI));

  /* ---- practice ---- */
  const T = (c, v) => (c === 0 ? "" : (c < 0 ? "-" : "+") + (Math.abs(c) === 1 && v ? "" : Math.abs(c)) + v);
  const cl = (s) => (s[0] === "+" ? s.slice(1) : s);
  M.registerPractice("words", () => {
    const n = P(["n", "x", "n"]), a = R(2, 9), b = R(2, 9), c = R(2, 9);
    const bank = [
      ["Think of a number " + n + ". Add " + a + ".", n + "+" + a],
      ["Think of a number " + n + ". Subtract " + a + " from it.", n + "-" + a],
      ["Think of a number " + n + ". Multiply it by " + a + ".", a + n],
      ["Think of a number " + n + ". Multiply it by " + a + ", then add " + b + ".", a + n + "+" + b],
      ["Think of a number " + n + ". Add " + a + ", then multiply the result by " + b + ".", b + "(" + n + "+" + a + ")"],
      ["A pen costs $" + n + ". Write the cost of " + a + " pens and a $" + b + " notebook.", a + n + "+" + b],
      ["Think of a number " + n + ". Divide it by " + a + ", then subtract " + b + ".", n + "/" + a + "-" + b],
      ["Think of a number " + n + ". Square it, then add " + a + ".", n + "^2+" + a],
      ["Take " + a + " times a number " + n + " away from " + (a * b) + ".", a * b + "-" + a + n]
    ];
    const [q, ans] = P(bank);
    return { q: q + " Write an expression.", keys: [n, "(", ")", "²", "−"], placeholder: "e.g. 3" + n + " + 5", check: (s) => A.equiv(s, ans), explain: "Build it step by step = " + A.disp(ans) + ".", hint: "Write each step of the words as maths, in order. Use brackets if the add comes before the multiply." };
  });
  M.registerPractice("collect", () => {
    for (let t = 0; t < 20; t++) { const g = collectGen(); if (g) return g; }
    return collectGen(true);
  });
  function collectGen(force) {
    const kind = R(0, 2); let src;
    if (kind === 0) { const a = R(2, 9), b = R(2, 9), c = R(1, 9), d = R(1, 9); src = a + "x" + T(P([1, -1]) * b, "y") + T(P([1, -1]) * c, "x") + T(-d, "y") + T(R(-9, 9) || 4, ""); }
    else if (kind === 1) { const a = R(2, 8), b = R(2, 8), c = R(2, 8); src = a + "x^2" + T(b, "x") + T(-R(1, a), "x^2") + T(-R(1, b - 1 || 1), "x") + T(c, ""); }
    else { const a = R(2, 9), b = R(2, 9), c = R(1, 5); src = a + "ab" + T(b, "a") + T(-c, "ab") + T(-R(1, 4), "a"); }
    src = cl(src);
    const target = A.poly(src), ans = A.polyStr(target);
    if (!force && (target.size === 0 || A.terms(A.parse(src)).length === target.size)) return null;
    return { q: "Simplify <span class=\"m\">" + A.disp(src) + "</span> by collecting like terms.", keys: KEYS, placeholder: "e.g. 8x + 3",
      check: (s) => A.checkExpanded(s, target).ok, explain: A.disp(src) + " = " + ans + ".",
      hint: (s) => { const r = A.checkExpanded(s, target); return r.why === "collect" ? "Right so far, but there are still like terms to combine." : r.why === "wrong" ? "Group the terms with exactly the same letters and powers, and add their numbers. Keep the sign in front of each term." : "Type it like 8x + 3 (use ^ or ² for powers)."; } };
  }
  M.registerPractice("subst", () => {
    const x = R(-5, 5) || 3, y = R(-4, 6) || 2, e = P(["3x^2-2y", "2x+3y", "x^2+y^2", "5x-y+4", "2x^2-3x", "xy-x", "4y-x^2", "x(y+2)", "x^3-y"]);
    const env = { x, y }, v = A.evalNode(A.parse(e), env), br = (c) => (env[c] < 0 ? "(" + A.fmt(env[c]) + ")" : env[c]);
    const sh = A.disp(e).replace(/[xy]/g, (c) => br(c));
    return { q: "Work out <span class=\"m\">" + A.disp(e) + "</span> when <span class=\"m\">x = " + A.fmt(x) + "</span> and <span class=\"m\">y = " + A.fmt(y) + "</span>.", keys: ["−"], placeholder: "e.g. −7",
      check: (s) => Math.abs(num(s) - v) < 1e-9, explain: "Substitute: " + sh + " = " + A.fmt(v) + ".",
      hint: "Put brackets round any negative value, then follow the order of operations (powers before × and +)." };
  });
  M.registerPractice("formula", () => {
    const kind = R(0, 4); let q, v, ex;
    if (kind === 0) { const u = R(2, 12), a = R(2, 6), t = R(2, 8); v = u + a * t; q = "The formula <span class=\"m\">v = u + at</span> gives final speed. Find v when u = " + u + ", a = " + a + " and t = " + t + "."; ex = u + " + " + a + " × " + t + " = " + v; }
    else if (kind === 1) { const l = R(3, 15), w = R(2, 10); v = 2 * l + 2 * w; q = "The perimeter of a rectangle is <span class=\"m\">P = 2l + 2w</span>. Find P when l = " + l + " and w = " + w + "."; ex = "2 × " + l + " + 2 × " + w + " = " + v; }
    else if (kind === 2) { const a = R(2, 9), b = R(2, 9), h = 2 * R(1, 6); v = (a + b) * h / 2; q = "The area of a trapezium is <span class=\"m\">A = ½(a + b)h</span>. Find A when a = " + a + ", b = " + b + " and h = " + h + "."; ex = "½ × (" + a + " + " + b + ") × " + h + " = " + v; }
    else if (kind === 3) { const u = R(2, 10), a = R(2, 6), t = 2 * R(1, 4); v = u * t + a * t * t / 2; q = "The distance travelled is <span class=\"m\">s = ut + ½at²</span>. Find s when u = " + u + ", a = " + a + " and t = " + t + "."; ex = u + " × " + t + " + ½ × " + a + " × " + t + "² = " + v; }
    else { const F = 9 * R(-3, 12) + 32; v = 5 * (F - 32) / 9; q = "To change Fahrenheit to Celsius, <span class=\"m\">C = 5(F − 32)/9</span>. Find C when F = " + F + "."; ex = "5 × (" + F + " − 32) ÷ 9 = " + A.fmt(v); }
    return { q, keys: ["−"], placeholder: "a number", check: (s) => Math.abs(num(s) - v) < 1e-9, explain: ex.replace(/-/g, "−") + ".", hint: "Replace each letter with its value, then work in the order of operations." };
  });

  ltUI(); sbUI();
  M.mountAll();
})();
