(function () {
  "use strict";
  const R = M.rnd, P = M.pick;
  const near = (x, y) => Math.abs(x - y) <= 1e-6 * Math.max(1, Math.abs(y));
  const num = (s) => M.parseNumber(String(s).replace(/[\s$]/g, ""));
  const clean = (x) => M.fmtNum(parseFloat(Number(x).toFixed(8)));

  /* ---- checklist and progress ---- */
  const KEY = "im:v1:revision:checks";
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { saved = {}; }
  document.querySelectorAll("input[data-k]").forEach((c) => {
    c.checked = !!saved[c.dataset.k];
    c.addEventListener("change", () => { saved[c.dataset.k] = c.checked; try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {} });
  });
  document.querySelectorAll("a[data-lesson]").forEach((a) => {
    const p = M.progress(a.dataset.lesson), el = a.parentNode.querySelector(".prog");
    if (!el) return;
    if (!p.total) el.textContent = "Not started";
    else if (p.done >= p.total) { el.textContent = "✓ practice done"; el.classList.add("done"); }
    else el.textContent = p.done + " of " + p.total + " sets done";
  });

  /* ---- mixed question pool ---- */
  const pool = [
    () => { const a = R(2, 9) * R(2, 6), b = R(2, 9) * R(2, 6); if (a === b) return pool[0](); const h = M.gcd(a, b);
      return { q: "Find the HCF of " + a + " and " + b + ".", placeholder: "a number", check: (s) => num(s) === h, explain: "Common factors, largest = " + h + ".", hint: "List the factors, or use prime factors." }; },
    () => { const a = R(3, 12), b = R(3, 12), l = M.lcm(a, b);
      return { q: "Find the LCM of " + a + " and " + b + ".", placeholder: "a number", check: (s) => num(s) === l, explain: "Smallest common multiple = " + l + ".", hint: "List multiples of each until they match." }; },
    () => { const b = P([2, 3, 5]), m = R(2, 6), n = R(2, 6);
      return { q: "Write <span class=\"m\">" + b + M.sup(m) + " × " + b + M.sup(n) + "</span> as a single power of " + b + ". Type the power only (the small number).", placeholder: "e.g. 7", check: (s) => num(s) === m + n, explain: "Add the powers: " + m + " + " + n + " = " + (m + n) + ".", hint: "When you multiply powers of the same base, add the powers." }; },
    () => { const m = R(11, 99) / 10, e = R(2, 5), v = Math.round(m * Math.pow(10, e)),
      s = clean(m);
      return { q: "Write <span class=\"m\">" + s + " × 10" + M.sup(e) + "</span> as an ordinary number.", placeholder: "e.g. 4500", check: (x) => num(x) === v, explain: s + " × 10" + M.sup(e) + " = " + M.fmtNum(v) + ".", hint: "Move the decimal point " + e + " places to the right." }; },
    () => { const p = P([5, 12, 15, 20, 35, 40, 60]), q = P([40, 80, 120, 160, 240, 300]), a = p * q / 100;
      return { q: "Find " + p + "% of " + q + ".", placeholder: "a number", check: (s) => near(num(s), a), explain: p + "% of " + q + " = " + clean(a) + ".", hint: "Divide by 100, then multiply by " + p + "." }; },
    () => { const a = R(2, 12), b = R(2, 12), c = R(2, 9);
      return { q: "Work out <span class=\"m\">" + M.minus("−" + a) + " + " + b + " × " + c + "</span>.", keys: ["−"], placeholder: "e.g. 14", check: (s) => num(s) === -a + b * c, explain: "Multiply first: " + b + " × " + c + " = " + b * c + ". Then " + M.minus(-a) + " + " + b * c + " = " + (b * c - a) + ".", hint: "× before +." }; },
    () => { const x = R(2, 9), y = R(2, 9), z = R(2, 9), v = (x + y) * z - x;
      return { q: "Work out <span class=\"m\">(" + x + " + " + y + ") × " + z + " − " + x + "</span>.", placeholder: "a number", check: (s) => num(s) === v, explain: "Brackets: " + (x + y) + ". " + (x + y) + " × " + z + " = " + (x + y) * z + ". " + (x + y) * z + " − " + x + " = " + v + ".", hint: "Brackets first, then ×, then −." }; },
    () => { const sq = R(3, 15); return { q: "Work out <span class=\"m\">" + sq + M.sup(2) + "</span>.", placeholder: "a number", check: (s) => num(s) === sq * sq, explain: sq + M.sup(2) + " = " + sq * sq + ".", hint: "Multiply the number by itself." }; },
    () => { const d = P([2, 3, 4, 5, 6, 8]), n1 = R(1, d - 1), n2 = R(1, d - 1), a = M.fracAdd(M.simplify(n1, d), M.simplify(n2, d));
      return { q: "Work out <span class=\"m\">" + n1 + "/" + d + " + " + n2 + "/" + d + "</span>. Give the answer in simplest form (like 7/12 or 1 1/2).", keys: ["/"], placeholder: "e.g. 7/12",
        check: (s) => { const v = M.parseFracAnswer(s); return !!v && v.n === a[0] && v.d === a[1] && v.simplest; }, explain: "Add the tops: " + (n1 + n2) + "/" + d + " = " + M.fracStr(a) + (a[0] > a[1] ? " = " + M.mixedStr(a) : "") + ".", hint: "The bottoms match, so add the tops, then simplify." }; },
    () => { const x = P([3.456, 12.0789, 0.04567, 58.296, 7.0049, 2.9953, 0.007382]), sf = P([2, 3]), a = M.roundSF(x, sf);
      return { q: "Round " + clean(x) + " to " + sf + " significant figures.", placeholder: "a number", check: (s) => near(num(s), a), explain: clean(x) + " to " + sf + " s.f. = " + M.toSF(x, sf) + ".", hint: "Count from the first non-zero digit, then check the next digit." }; },
    () => { const A = R(2, 9), B = R(2, 9) * P([1, 10]), C = P([2, 4, 5]), r = A * B / C;
      return { q: "Estimate <span class=\"m\">" + clean(A + 0.2) + " × " + clean(B + (B > 9 ? 1 : 0.2)) + " ÷ " + clean(C + 0.1) + "</span> by rounding each number to 1 significant figure.", placeholder: "e.g. 200", check: (s) => near(num(s), r), explain: clean(A) + " × " + clean(B) + " ÷ " + clean(C) + " = " + clean(r) + ".", hint: "Round each number to 1 s.f. first." }; },
    () => { const r = P([[1, 2], [2, 3], [3, 5], [1, 4]]), one = R(3, 15), tot = one * (r[0] + r[1]), big = Math.max(r[0], r[1]) * one;
      return { q: "Share $" + tot + " in the ratio <span class=\"m\">" + r[0] + " : " + r[1] + "</span>. How many dollars is the bigger share?", placeholder: "a number", check: (s) => near(num(s), big), explain: r[0] + " + " + r[1] + " = " + (r[0] + r[1]) + " parts. One part = " + one + ". Bigger share = " + big + ".", hint: "Divide the total by the number of parts, then multiply." }; },
    () => { const v = R(4, 18) * 5, t = P([1.5, 2, 2.5, 3, 4]);
      return { q: "A car travels " + clean(v * t) + " km in " + clean(t) + " hours. What is its average speed in km/h?", placeholder: "a number", check: (s) => near(num(s), v), explain: clean(v * t) + " ÷ " + clean(t) + " = " + v + " km/h.", hint: "speed = distance ÷ time" }; },
    () => { const p = P([500, 1000, 2000, 4000]), r = P([3, 4, 5, 6]), n = R(2, 3), A = Math.round(p * Math.pow(1 + r / 100, n) * 100) / 100;
      return { q: "$" + p + " earns " + r + "% compound interest per year for " + n + " years. How much is it worth at the end, to the nearest cent?", placeholder: "e.g. 1102.50", check: (s) => Math.abs(num(s) - A) < 0.0051, explain: p + " × " + clean(1 + r / 100) + M.sup(n) + " = " + clean(A) + ".", hint: "A = P(1 + R/100)ⁿ" }; },
    () => { const p = P([60, 80, 120, 150, 240]), d = P([10, 20, 25, 30]), a = p * (1 - d / 100);
      return { q: "A jacket costs $" + p + ". It is " + d + "% off. What is the sale price in dollars?", placeholder: "a number", check: (s) => near(num(s), a), explain: p + " × " + clean(1 - d / 100) + " = " + clean(a) + ".", hint: "Multiply by (1 − discount ÷ 100)." }; },
    () => { const t = R(13, 23) * 60 + P([0, 5, 15, 20, 25, 30, 40, 45, 50, 55]);
      return { q: "Write " + M.fmt24(t) + " in 12-hour time with am or pm.", placeholder: "e.g. 3:25 pm", check: (s) => /[ap]m/i.test(s) && M.parseTime(s) === t, explain: M.fmt24(t) + " = " + M.fmt12(t) + ".", hint: "Take 12 off the hour and write pm." }; },
    () => { const a = R(5, 14), b = R(5, 14), both = R(2, 4), u = a + b - both;
      return { q: "n(A) = " + a + ", n(B) = " + b + " and n(A ∩ B) = " + both + ". Find n(A ∪ B).", placeholder: "a number", check: (s) => num(s) === u, explain: a + " + " + b + " − " + both + " = " + u + ".", hint: "n(A ∪ B) = n(A) + n(B) − n(A ∩ B)" }; },
    () => { const n = R(2, 5), d = P([4, 5, 8, 10]), dec = n / d; if (n >= d) return pool[16]();
      return { q: "Write " + n + "/" + d + " as a decimal.", placeholder: "e.g. 0.75", check: (s) => near(num(s), dec), explain: n + " ÷ " + d + " = " + clean(dec) + ".", hint: "Divide the top by the bottom." }; },
    () => { const a = R(2, 5), b = R(2, 9), m = R(2, 9);
      return { q: "Work out <span class=\"m\">" + M.paren(-a) + " × " + M.paren(-b) + "</span>.", keys: ["−"], placeholder: "e.g. 12", check: (s) => num(s) === a * b, explain: "Negative × negative = positive: " + a + " × " + b + " = " + a * b + ".", hint: "Two negatives multiply to give a positive." }; },
    () => { const k = R(3, 9), s = k * k;
      return { q: "Find the square root of " + s + ".", placeholder: "a number", check: (x) => num(x) === k, explain: "√" + s + " = " + k + ".", hint: "Which number times itself gives " + s + "?" }; }
  ];
  const draw = () => { for (let i = 0; i < 20; i++) { try { return P(pool)(); } catch (e) {} } return pool[4](); };
  ["mix1", "mix2", "mix3", "mix4"].forEach((n) => M.registerPractice(n, draw));
  M.mountAll();
})();
