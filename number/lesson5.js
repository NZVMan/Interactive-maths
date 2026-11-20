(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const mn = M.minus;
  const say = (el, lines) => { el.textContent = ""; lines.forEach((l) => { const d = document.createElement("div"); d.textContent = l; el.appendChild(d); }); };

  /* ---- 1. Order of operations ---- */
  function opUI() {
    const out = $("op-out");
    const r = M.evalSteps($("op-in").value);
    out.textContent = "";
    if (r.error) { say(out, [r.error]); return; }
    const first = document.createElement("div"); first.textContent = "Start: " + r.start; out.appendChild(first);
    if (r.steps.length) {
      const ol = document.createElement("ol"); ol.className = "steps";
      r.steps.forEach((s) => { const li = document.createElement("li"); li.textContent = s.note + "   →   " + s.expr; ol.appendChild(li); });
      out.appendChild(ol);
    }
    const ans = document.createElement("div"); ans.innerHTML = "<strong></strong>"; ans.firstChild.textContent = "Answer: " + mn(r.result); out.appendChild(ans);
  }
  ["2 + 3 × 4", "(2 + 3) × 4", "20 − 3 × (4 + 1)", "−3 + 2 × (−4)", "2 × 3^2", "(2 × 3)^2", "8 ÷ 2 × 4", "12 − 3 − 2"].forEach((ex) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = ex;
    b.addEventListener("click", () => { $("op-in").value = ex; opUI(); });
    $("op-ex").appendChild(b);
  });
  $("op-go").addEventListener("click", opUI);
  $("op-in").addEventListener("keydown", (e) => { if (e.key === "Enter") opUI(); });

  /* ---- 2. Fraction calculator ---- */
  const imp = (f) => (f[1] === 1 ? mn(f[0]) : mn(f[0]) + "/" + f[1]);
  function fcUI() {
    const out = $("fc-out"), a = M.parseFracInput($("fc-a").value), b = M.parseFracInput($("fc-b").value), op = $("fc-op").value;
    if (!a || !b) return say(out, ["Type fractions like 3/4, mixed numbers like 2 1/3, or whole numbers. The bottom can't be 0."]);
    const lines = [];
    const sa = $("fc-a").value.trim().replace(/-/g, "−"), sb = $("fc-b").value.trim().replace(/-/g, "−");
    if (/ /.test(sa)) lines.push(sa + " = " + imp(a) + " (as an improper fraction)");
    if (/ /.test(sb)) lines.push(sb + " = " + imp(b) + " (as an improper fraction)");
    let res;
    if (op === "+" || op === "-") {
      const L = M.lcm(a[1], b[1]), fa = a[0] * (L / a[1]), fb = b[0] * (L / b[1]);
      lines.push("Common denominator: the LCM of " + a[1] + " and " + b[1] + " is " + L + ".");
      lines.push(imp(a) + " = " + mn(fa) + "/" + L + "   and   " + imp(b) + " = " + mn(fb) + "/" + L);
      const top = op === "+" ? fa + fb : fa - fb;
      lines.push((op === "+" ? "Add" : "Subtract") + " the tops: " + mn(fa) + (op === "+" ? " + " : " − ") + (fb < 0 ? "(" + mn(fb) + ")" : fb) + " = " + mn(top) + ", so " + mn(top) + "/" + L);
      res = op === "+" ? M.fracAdd(a, b) : M.fracSub(a, b);
    } else if (op === "*") {
      lines.push("Multiply the tops and the bottoms: " + mn(a[0]) + " × " + (b[0] < 0 ? "(" + mn(b[0]) + ")" : b[0]) + " = " + mn(a[0] * b[0]) + " and " + a[1] + " × " + b[1] + " = " + a[1] * b[1]);
      lines.push("So " + imp(a) + " × " + imp(b) + " = " + mn(a[0] * b[0]) + "/" + a[1] * b[1]);
      res = M.fracMul(a, b);
    } else {
      if (b[0] === 0) return say(out, ["You can't divide by zero."]);
      const flipped = b[0] < 0 ? [-b[1], -b[0]] : [b[1], b[0]];
      lines.push("Dividing is the same as multiplying by the flipped fraction: " + imp(a) + " ÷ " + imp(b) + " = " + imp(a) + " × " + (flipped[1] === 1 ? mn(flipped[0]) : mn(flipped[0]) + "/" + flipped[1]));
      res = M.fracDiv(a, b);
    }
    lines.push("Simplify and write the answer: " + imp(res) + (Math.abs(res[0]) > res[1] && res[1] !== 1 ? "  =  " + M.mixedStr(res) : ""));
    say(out, lines);
  }
  ["fc-a", "fc-op", "fc-b"].forEach((id) => $(id).addEventListener("input", fcUI));

  /* ---- 3. Decimal multiplication ---- */
  function dmUI() {
    const out = $("dm-out"), sa = $("dm-a").value.trim(), sb = $("dm-b").value.trim();
    const ok = (s) => /^(\d{1,6}\.?\d{0,4}|\.\d{1,4})$/.test(s);
    if (!ok(sa) || !ok(sb)) return say(out, ["Type two positive decimals, like 0.3 and 0.04 (up to 4 decimal places)."]);
    const dp = (s) => (s.indexOf(".") === -1 ? 0 : s.length - s.indexOf(".") - 1);
    const da = dp(sa), db = dp(sb), ia = parseInt(sa.replace(".", ""), 10), ib = parseInt(sb.replace(".", ""), 10);
    const prod = ia * ib, total = da + db;
    const ans = M.shiftDecimal(String(prod), -total);
    say(out, [
      "Ignore the decimal points: " + sa + " becomes " + ia + " and " + sb + " becomes " + ib + ".",
      "Multiply: " + ia + " × " + ib + " = " + prod + ".",
      "Count the decimal places: " + da + " + " + db + " = " + total + ".",
      "Put the point back so there are " + total + " decimal places: " + sa + " × " + sb + " = " + ans
    ]);
  }
  ["dm-a", "dm-b"].forEach((id) => $(id).addEventListener("input", dmUI));

  /* ---- Practice ---- */
  const near = (x, y) => Math.abs(x - y) < 1e-9;
  const R = M.rnd, P = M.pick;
  const num = (s) => M.parseNumber(String(s).replace(/\s+/g, ""));
  const fracHTML = (f) => {
    const neg = f[0] < 0 ? "−" : "", n = Math.abs(f[0]), d = f[1];
    if (d === 1) return neg + n;
    if (n > d) { const w = Math.floor(n / d), r = n % d; return neg + (r ? w + '<span class="frac"><span>' + r + "</span><span>" + d + "</span></span>" : w); }
    return neg + '<span class="frac"><span>' + n + "</span><span>" + d + "</span></span>";
  };
  const impHTML = (f) => (f[1] === 1 ? mn(f[0]) : (f[0] < 0 ? "−" : "") + '<span class="frac"><span>' + Math.abs(f[0]) + "</span><span>" + f[1] + "</span></span>");

  M.registerPractice("orderops", () => {
    const a = R(2, 9), b = R(2, 9), c = R(2, 9), d = R(1, 6);
    const templates = [
      () => a + " + " + b + " × " + c,
      () => a + " × " + b + " − " + c,
      () => "(" + a + " + " + b + ") × " + c,
      () => (a + 10) + " − " + b + " × " + c,
      () => a + " + " + b + " × (" + c + " − " + d + ")",
      () => "(" + (a + 5) + " − " + b + ")^2 + " + c,
      () => a + "^2 − " + b + " × " + c,
      () => "−" + a + " + " + b + " × (−" + c + ")",
      () => (a * b) + " ÷ " + b + " + " + c + " × " + d,
      () => (a + 10) + " − (" + b + " − " + c + ")",
      () => c * d + " ÷ (" + d + " + " + (R(0, 2)) + d * 0 + ") + " + a
    ];
    let expr, r;
    for (let tries = 0; tries < 30; tries++) {
      expr = P(templates.slice(0, 10))();
      r = M.evalSteps(expr);
      if (!r.error && Number.isInteger(r.result) && Math.abs(r.result) < 200) break;
    }
    const show = expr.replace(/\^2/g, "²");
    const chain = [r.start].concat(r.steps.map((s) => s.expr)).join("  →  ");
    return { q: "Work out <span class=\"m\">" + show + "</span>.", keys: ["−"], placeholder: "e.g. 14 or −8", check: (s) => near(num(s), r.result),
      explain: chain.replace(/\^2/g, "²") + ".", hint: "Brackets first, then powers, then × and ÷ from the left, then + and − from the left." };
  });

  M.registerPractice("fracops", () => {
    const kind = P(["add", "sub", "mul", "div", "add", "mul", "conv", "neg"]);
    const prop = () => { const d = P([2, 3, 4, 5, 6, 8, 10]), n = R(1, d - 1); return M.simplify(n, d); };
    const mixed = () => { const d = P([2, 3, 4, 5]); let n; do { n = R(1, d - 1); } while (M.gcd(n, d) !== 1); const w = R(1, 3); return [w * d + n, d]; };
    let a, b, ans, qtxt, why, hint;
    const tail = " Give your answer as a fraction in its simplest form (like 7/12 or 1 1/2).";
    if (kind === "conv") {
      const f = mixed();
      if (Math.random() < 0.5) { qtxt = "Write <span class=\"m\">" + impHTML(f) + "</span> as a mixed number."; ans = f; why = f[0] + "/" + f[1] + " = " + M.mixedStr(f) + "."; hint = "Divide the top by the bottom: the whole part is how many times it fits, the remainder goes on top."; }
      else { qtxt = "Write <span class=\"m\">" + fracHTML(f) + "</span> as an improper fraction."; ans = f; why = M.mixedStr(f) + " = " + f[0] + "/" + f[1] + "."; hint = "Multiply the whole number by the bottom, then add the top."; }
      return { q: qtxt + " (Type it like 7/2.)", keys: ["/"], placeholder: "e.g. 7/2", check: (s) => { const v = M.parseFracAnswer(s); return !!v && v.n === ans[0] && v.d === ans[1] && (/ /.test(s) ? true : true); }, explain: why, hint };
    }
    if (kind === "neg") {
      a = prop(); b = prop(); a = [-a[0], a[1]];
      ans = M.fracAdd(a, b);
      qtxt = "Work out <span class=\"m\">" + fracHTML(a) + " + " + fracHTML(b) + "</span>.";
      why = "Common denominator " + M.lcm(a[1], b[1]) + ": " + M.fracStr(M.fracAdd(a, b)) + (Math.abs(ans[0]) > ans[1] ? " = " + M.mixedStr(ans) : "") + ".";
      hint = "Use a common denominator. A negative fraction has a negative top.";
    } else {
      if (kind === "mul" || kind === "div") { a = Math.random() < 0.4 ? mixed() : prop(); b = prop(); } else { a = prop(); b = prop(); }
      const sym = { add: " + ", sub: " − ", mul: " × ", div: " ÷ " }[kind];
      if (kind === "sub" && a[0] * b[1] < b[0] * a[1]) { const t = a; a = b; b = t; }
      ans = kind === "add" ? M.fracAdd(a, b) : kind === "sub" ? M.fracSub(a, b) : kind === "mul" ? M.fracMul(a, b) : M.fracDiv(a, b);
      qtxt = "Work out <span class=\"m\">" + fracHTML(a) + sym + fracHTML(b) + "</span>.";
      why = M.fracStr(a) + sym + M.fracStr(b) + " = " + M.fracStr(ans) + (Math.abs(ans[0]) > ans[1] ? " = " + M.mixedStr(ans) : "") + ".";
      hint = kind === "add" || kind === "sub" ? "Give both fractions the same bottom number first." : kind === "mul" ? "Multiply the tops and multiply the bottoms. Change mixed numbers to improper fractions first." : "Flip the second fraction, then multiply. Change mixed numbers to improper fractions first.";
    }
    return { q: qtxt + tail, keys: ["/"], placeholder: "e.g. 7/12 or 1 1/2",
      check: (s) => { const v = M.parseFracAnswer(s); return !!v && v.n === ans[0] && v.d === ans[1] && v.simplest; },
      explain: why,
      hint: (s) => { const v = M.parseFracAnswer(s); return v && v.n === ans[0] && v.d === ans[1] && !v.simplest ? "That's the right value, but it isn't in its simplest form yet. Divide the top and bottom by their HCF." : hint; } };
  });

  M.registerPractice("decops", () => {
    const kind = P(["add", "sub", "mul", "div"]);
    const dec = (dp, lo, hi) => { const i = R(lo, hi); return { s: M.shiftDecimal(String(i), -dp), v: parseFloat(M.shiftDecimal(String(i), -dp)) }; };
    let q, ans, why, hint;
    if (kind === "add") { const a = dec(2, 120, 2500), b = dec(1, 15, 90); ans = a.v + b.v; q = a.s + " + " + b.s; why = a.s + " + " + b.s + " = " + M.fmtNum(parseFloat(ans.toFixed(6))) + "."; hint = "Line up the decimal points, then add."; }
    else if (kind === "sub") { const b = dec(1, 15, 90), a = dec(2, 1100, 3000); ans = a.v - b.v; q = a.s + " − " + b.s; why = a.s + " − " + b.s + " = " + M.fmtNum(parseFloat(ans.toFixed(6))) + "."; hint = "Line up the decimal points, then subtract."; }
    else if (kind === "mul") { const a = dec(1, 2, 90), b = dec(P([1, 2]), 2, 9); ans = a.v * b.v; q = a.s + " × " + b.s; why = "Ignore the points, multiply, then count decimal places: " + a.s + " × " + b.s + " = " + M.fmtNum(parseFloat(ans.toFixed(6))) + "."; hint = "Multiply as whole numbers, then put the point back: the answer has as many decimal places as both numbers together."; }
    else { const d = dec(1, 2, 9), r = R(2, 15); const total = parseFloat((d.v * r).toFixed(6)); ans = r; q = M.fmtNum(total) + " ÷ " + d.s; why = "Multiply both by 10: " + M.fmtNum(total * 10) + " ÷ " + (d.v * 10) + " = " + r + "."; hint = "Multiply both numbers by 10 so you are dividing by a whole number."; }
    return { q: "Work out <span class=\"m\">" + q + "</span>.", placeholder: "e.g. 3.45", check: (s) => near(num(s), parseFloat(ans.toFixed(6))), explain: why, hint };
  });

  opUI(); fcUI(); dmUI();
  M.mountAll();
})();
