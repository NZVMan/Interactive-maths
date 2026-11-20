(function () {
  "use strict";
  const { $, say } = A.ui, R = M.rnd, P = M.pick, MINUS = A.MINUS;
  const num = (s) => M.parseNumber(String(s).trim().replace(/^[a-z]\s*=\s*/i, "").replace(/\s+/g, ""));
  const STORIES = [
    { t: "I think of a number, double it and add 7. The answer is 19.", lets: "Let the number be x.", parts: ["Double it: 2x", "Add 7: 2x + 7", "The answer is 19: 2x + 7 = 19"], eq: "2x + 7 = 19" },
    { t: "I think of a number, add 7 and then double the result. The answer is 24.", lets: "Let the number be x.", parts: ["Add 7: x + 7", "Double the result (use a bracket): 2(x + 7)", "The answer is 24: 2(x + 7) = 24"], eq: "2(x + 7) = 24" },
    { t: "A taxi charges $4 plus $3 for every kilometre. A trip costs $19.", lets: "Let the number of kilometres be k.", parts: ["Cost of the kilometres: 3k", "Plus the $4: 3k + 4", "The trip costs $19: 3k + 4 = 19"], eq: "3k + 4 = 19" },
    { t: "The rectangle's length is x + 3 and its width is x. The perimeter is 26 cm.", lets: "Let the width be x cm.", parts: ["Perimeter = 2 × length + 2 × width", "2(x + 3) + 2x = 26"], eq: "2(x + 3) + 2x = 26" },
    { t: "Three times a number, minus 4, is the same as the number plus 10.", lets: "Let the number be x.", parts: ["Three times the number, minus 4: 3x − 4", "The number plus 10: x + 10", "They are the same: 3x − 4 = x + 10"], eq: "3x − 4 = x + 10" }
  ];
  const sel = $("fe-s"); STORIES.forEach((s, i) => { const o = document.createElement("option"); o.value = i; o.textContent = s.t.length > 52 ? s.t.slice(0, 50) + "…" : s.t; sel.appendChild(o); });
  function feUI() { const s = STORIES[+sel.value], r = A.solveLinear(s.eq); const lines = [s.t, s.lets].concat(s.parts, ["Solve: " + r.steps.slice(1).map((x) => x.eq).filter(Boolean).join(",  ")]); lines.push("Answer: " + r.answer.replace(/-/g, MINUS)); say($("fe-out"), lines); }
  sel.addEventListener("input", feUI); feUI();

  const trivial = (p) => { const s = String(p).split("="); if (s.length !== 2) return true; const L = A.tryPoly(s[0]), Rr = A.tryPoly(s[1]); if (!L || !Rr) return true;
    const single = (q) => q.size === 1 && /^[a-z]1$/.test(Array.from(q.keys())[0]) && Array.from(q.values())[0] === 1, cst = (q) => q.size === 0 || (q.size === 1 && q.has("")); return (single(L) && cst(Rr)) || (single(Rr) && cst(L)); };
  const checkEq = (s, x0) => { if (trivial(s)) return false; const r = A.solveLinear(s); return !!r.ok && Math.abs(r.value - x0) < 1e-9; };
  const eqHint = (x0) => (s) => (String(s).includes("=") ? (trivial(s) ? "Write the equation from the words first (don't just write the answer)." : "Solve your equation: does it give x = " + A.fmt(x0) + "? If not, check the order of the steps and your brackets.") : "An equation needs an = sign.");
  M.registerPractice("form1", () => { const x0 = R(2, 12), a = R(2, 5), b = R(1, 9), k = R(0, 3); let q, ex;
    if (k === 0) { q = "I think of a number, multiply it by " + a + " and add " + b + ". The answer is " + (a * x0 + b) + ". Write an equation (any letter) for this."; ex = a + "x + " + b + " = " + (a * x0 + b); }
    else if (k === 1) { q = "I think of a number, add " + b + " and multiply the result by " + a + ". The answer is " + a * (x0 + b) + ". Write an equation for this."; ex = a + "(x + " + b + ") = " + a * (x0 + b); }
    else if (k === 2) { q = "A plumber charges $" + b * 10 + " plus $" + a * 5 + " per hour. A job costs $" + (b * 10 + a * 5 * x0) + ". Write an equation using h for the hours."; ex = a * 5 + "h + " + b * 10 + " = " + (b * 10 + a * 5 * x0); }
    else { q = "Take " + a + " times a number, then subtract " + b + ". This is the same as the number plus " + ((a - 1) * x0 - b) + ". Write an equation for this."; ex = a + "x − " + b + " = x + " + ((a - 1) * x0 - b); }
    return { q, keys: ["x", "(", ")", "=", "−"], placeholder: "e.g. 2x + 7 = 19", check: (s) => checkEq(s, x0), explain: "Equation: " + ex + ". Solving it gives " + x0 + ".", hint: eqHint(x0) }; });
  const ans = (q, x0, ex, h) => ({ q, keys: ["−"], placeholder: "a number", check: (s) => Math.abs(num(s) - x0) < 1e-9, explain: ex + " = " + x0 + ".", hint: h });
  M.registerPractice("form2", () => { const k = R(0, 3);
    if (k === 0) { const n = R(3, 15), a = R(2, 5), b = R(1, 9); return ans("I think of a number, multiply it by " + a + " and add " + b + ". The answer is " + (a * n + b) + ". What is my number?", n, a + "x + " + b + " = " + (a * n + b) + ", " + a + "x = " + a * n + ", x", "Write the equation, undo the + first, then divide."); }
    if (k === 1) { const w = R(3, 12), d = R(2, 8); return ans("A rectangle's length is " + d + " cm more than its width. Its perimeter is " + (4 * w + 2 * d) + " cm. What is the width in cm?", w, "2(x + " + d + ") + 2x = " + (4 * w + 2 * d) + ", 4x + " + 2 * d + " = " + (4 * w + 2 * d) + ", x", "Let the width be x. Length = x + " + d + ". Perimeter = 2 × length + 2 × width."); }
    if (k === 2) { const n = R(3, 15); return ans("Three consecutive whole numbers add up to " + (3 * n + 3) + ". What is the smallest?", n, "x + (x + 1) + (x + 2) = " + (3 * n + 3) + ", 3x + 3 = " + (3 * n + 3) + ", x", "Call the numbers x, x + 1 and x + 2."); }
    const age = R(5, 15), g = R(2, 4); return ans("Maia is " + age + " years old. Her father is " + g + " times her age plus 2 years. Together their ages total " + (age + g * age + 2) + ". How old is Maia?", age, "x + (" + g + "x + 2) = " + (age + g * age + 2) + ", " + (g + 1) + "x + 2 = " + (age + g * age + 2) + ", x", "Let Maia's age be x. Her father's age is " + g + "x + 2."); });
  M.registerPractice("form3", () => { const k = R(0, 2);
    if (k === 0) { const km = R(3, 20), f = R(2, 6), r = R(2, 5); return ans("A taxi costs $" + f + " plus $" + r + " per kilometre. A trip costs $" + (f + r * km) + ". How many kilometres was the trip?", km, r + "k + " + f + " = " + (f + r * km) + ", " + r + "k = " + r * km + ", k", "Write cost = fixed charge + rate × distance, then solve."); }
    if (k === 1) { const x = R(5, 12), b = R(1, 6), c = 2 * x - b; return ans("Three times a number, minus " + b + ", is the same as the number plus " + c + ". What is the number?", x, "3x − " + b + " = x + " + c + ", 2x − " + b + " = " + c + ", 2x = " + (c + b) + ", x", "Write 3x − " + b + " = x + " + c + ", then collect the x terms on one side."); }
    const n = R(2, 9), a = R(2, 6); return ans("Four times a number, minus " + a + ", gives " + (4 * n - a) + ". What is the number?", n, "4x − " + a + " = " + (4 * n - a) + ", 4x = " + 4 * n + ", x", "Write 4x − " + a + " = " + (4 * n - a) + ", add " + a + " to both sides, then divide by 4."); });
  M.mountAll();
})();
