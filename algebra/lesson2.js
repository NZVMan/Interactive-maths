(function () {
  "use strict";
  const { $, say } = A.ui, R = M.rnd, P = M.pick;
  const KEYS = ["(", ")", "/", "−", "²", "√"];
  const BANK = [
    { f: "y = mx + c", s: { x: ["Subtract c from both sides: y − c = mx", "Divide both sides by m: (y − c)/m = x"], "x_": "x = (y − c)/m", m: ["Subtract c from both sides: y − c = mx", "Divide both sides by x: (y − c)/x = m"], "m_": "m = (y − c)/x" } },
    { f: "v = u + at", s: { u: ["Subtract at from both sides: v − at = u"], "u_": "u = v − at", t: ["Subtract u from both sides: v − u = at", "Divide both sides by a: (v − u)/a = t"], "t_": "t = (v − u)/a" } },
    { f: "A = πr²", s: { r: ["Divide both sides by π: A/π = r²", "Take the square root of both sides: √(A/π) = r"], "r_": "r = √(A/π)" } },
    { f: "C = 2πr", s: { r: ["Divide both sides by 2π: C/(2π) = r"], "r_": "r = C/(2π)" } },
    { f: "P = 2l + 2w", s: { w: ["Subtract 2l from both sides: P − 2l = 2w", "Divide both sides by 2: (P − 2l)/2 = w"], "w_": "w = (P − 2l)/2" } },
    { f: "C = 5(F − 32)/9", s: { F: ["Multiply both sides by 9: 9C = 5(F − 32)", "Divide both sides by 5: 9C/5 = F − 32", "Add 32 to both sides: 9C/5 + 32 = F"], "F_": "F = 9C/5 + 32" } }
  ];
  const fsel = $("fm-f"), ssel = $("fm-s");
  BANK.forEach((b, i) => { const o = document.createElement("option"); o.value = i; o.textContent = b.f; fsel.appendChild(o); });
  function subjects() { const b = BANK[+fsel.value]; ssel.textContent = ""; Object.keys(b.s).filter((k) => !k.endsWith("_")).forEach((k) => { const o = document.createElement("option"); o.value = k; o.textContent = k; ssel.appendChild(o); }); fmUI(); }
  function fmUI() {
    const b = BANK[+fsel.value], k = ssel.value; if (!b.s[k]) return;
    say($("fm-out"), ["Start: " + b.f].concat(b.s[k].map((l, i) => "Step " + (i + 1) + ". " + l), ["Answer: " + b.s[k + "_"]]));
  }
  fsel.addEventListener("input", subjects); ssel.addEventListener("input", fmUI);
  fsel.value = 1; subjects();

  const ask = (lhs, rhs, v, ans, steps, hint) => ({
    q: "Make <span class=\"m\">" + v + "</span> the subject of <span class=\"m\">" + A.disp(lhs + "=" + rhs) + "</span>.", keys: KEYS, placeholder: "e.g. " + v + " = (y − 3)/2",
    check: (s) => A.checkSubject(lhs, rhs, v, s), explain: steps + " = " + A.disp(v + "=" + ans).replace(v + " = ", "") + ".", hint: (s) => { const t = String(s).trim(); return !t ? hint : /\//.test(t) && !/\(/.test(t) ? "Check your brackets: if you divide a whole side, put it in brackets, like (y − 3)/2." : hint; }, _ans: ans });
  M.registerPractice("rearr1", () => {
    const a = R(2, 9), b = R(2, 12), k = R(0, 5);
    if (k === 0) return ask("y", a + "x+" + b, "x", "(y-" + b + ")/" + a, "y − " + b + " = " + a + "x, then divide by " + a + ": x", "Undo the + first (subtract it from both sides), then undo the × (divide).");
    if (k === 1) return ask("y", a + "x-" + b, "x", "(y+" + b + ")/" + a, "y + " + b + " = " + a + "x, then divide by " + a + ": x", "Undo the − first (add it to both sides), then divide.");
    if (k === 2) return ask("v", "u+" + a + "t", "t", "(v-u)/" + a, "v − u = " + a + "t, then divide by " + a + ": t", "Subtract u from both sides, then divide by " + a + ".");
    if (k === 3) return ask("P", "2l+2w", "w", "(P-2l)/2", "P − 2l = 2w, then divide by 2: w", "Subtract 2l from both sides, then divide by 2.");
    if (k === 4) return ask("F", "ma", "a", "F/m", "Divide both sides by m: a", "Divide both sides by m.");
    return ask("d", "st", "t", "d/s", "Divide both sides by s: t", "Divide both sides by s.");
  });
  M.registerPractice("rearr2", () => {
    const a = R(2, 7), b = R(2, 9), k = R(0, 5);
    if (k === 0) return ask("y", a + "(x+" + b + ")", "x", "y/" + a + "-" + b, "Divide by " + a + ": y/" + a + " = x + " + b + ", then subtract " + b + ": x", "Divide both sides by " + a + " first, then subtract " + b + ". Or expand the brackets first.");
    if (k === 1) return ask("y", "x/" + a + "+" + b, "x", a + "(y-" + b + ")", "y − " + b + " = x/" + a + ", then multiply by " + a + ": x", "Subtract " + b + ", then multiply both sides by " + a + ".");
    if (k === 2) return ask("A", "πr^2", "r", "√(A/π)", "A/π = r², then square root: r", "Divide by π, then take the square root.");
    if (k === 3) return ask("A", a + "x^2", "x", "√(A/" + a + ")", "A/" + a + " = x², then square root: x", "Divide by " + a + ", then take the square root.");
    if (k === 4) return ask("C", "5(F-32)/9", "F", "9C/5+32", "9C = 5(F − 32), then 9C/5 = F − 32, then add 32: F", "Multiply by 9, divide by 5, then add 32.");
    return ask("y", "(x+" + b + ")/" + a, "x", a + "y-" + b, "Multiply by " + a + ": " + a + "y = x + " + b + ", then subtract " + b + ": x", "Multiply both sides by " + a + ", then subtract " + b + ".");
  });
  M.mountAll();
})();
