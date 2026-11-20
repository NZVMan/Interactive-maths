(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const mn = M.minus, R = M.rnd, P = M.pick;
  const near = (x, y) => Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(y));
  const num = (s) => M.parseNumber(String(s).replace(/\s+/g, ""));
  const clean = (x) => M.fmtNum(parseFloat(Number(x).toFixed(8)));
  const say = (el, lines) => { el.textContent = ""; lines.forEach((l) => { const d = document.createElement("div"); d.textContent = l; el.appendChild(d); }); };
  const show = (e) => e.replace(/\^2/g, "²").replace(/\^3/g, "³");

  /* ---- 1. Calculator pitfalls ---- */
  function caUI() {
    const out = $("ca-out"), a = M.evalSteps($("ca-m").value), b = M.evalSteps($("ca-t").value);
    if (a.error || b.error) return say(out, [a.error || b.error]);
    const same = Math.abs(a.result - b.result) < 1e-9;
    say(out, ["What you meant: " + mn(clean(M.roundDP(a.result, 6))), "What you typed: " + mn(clean(M.roundDP(b.result, 6))),
      same ? "Same answer. Good typing." : "Different answers! The calculator did what you typed, not what you meant. Add brackets."]);
  }
  [["(5.2 + 3.8) ÷ 3", "5.2 + 3.8 ÷ 3"], ["(−3)^2", "−3^2"], ["2 × (3 + 4)^2", "2 × 3 + 4^2"], ["24 ÷ (2 × 3)", "24 ÷ 2 × 3"], ["(8 + 4) ÷ (2 + 1)", "(8 + 4) ÷ (2 + 1)"]].forEach((p) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = p[0] + "  vs  " + p[1];
    b.addEventListener("click", () => { $("ca-m").value = p[0]; $("ca-t").value = p[1]; caUI(); });
    $("ca-ex").appendChild(b);
  });
  ["ca-m", "ca-t"].forEach((id) => $(id).addEventListener("input", caUI));

  /* ---- 3. Clock slider ---- */
  function clUI() {
    const t = parseInt($("cl-r").value, 10), h = Math.floor(t / 60), m = t % 60;
    $("cl-svg").innerHTML = M.clockSVG(h, m, 170);
    say($("cl-out"), ["12-hour: " + M.fmt12(t), "24-hour: " + M.fmt24(t), h >= 12 ? "After noon, so 24-hour = 12-hour hour + 12 (except 12 pm)." : "Before noon, so the hour stays the same (12 am is 00)."]);
  }
  $("cl-r").addEventListener("input", clUI);

  /* ---- 4. Duration ---- */
  function duUI() {
    const out = $("du-out"), a = M.parseTime($("du-a").value), b = M.parseTime($("du-b").value);
    if (a === null || b === null) return say(out, ["Type times like 10:45, 3.20pm or 1530."]);
    let d = b - a; const wrap = d <= 0; if (wrap) d += 1440;
    say(out, [M.fmt24(a) + " to " + M.fmt24(b) + (wrap ? " (the next day)" : ""), "Duration: " + M.durationStr(d) + "  (" + d + " minutes)"]);
  }
  ["du-a", "du-b"].forEach((id) => $(id).addEventListener("input", duUI));

  /* ---- Practice ---- */
  M.registerPractice("calcuse", () => {
    const d = (lo, hi) => parseFloat(M.shiftDecimal(String(R(lo, hi)), -1)), a = d(12, 95), b = d(12, 95), c = d(11, 59);
    const templates = [
      () => "(" + a + " + " + b + ") ^2 ÷ " + c,
      () => "(" + a + " − " + b + ") ÷ (" + c + " + " + d(11, 40) + ")",
      () => a + " × " + b + " ÷ (" + c + " + " + d(11, 40) + ")",
      () => a + "^2 − " + b + " × " + c,
      () => "(" + a + " + " + b + ") ÷ " + c + " + " + d(12, 50) + "^2"
    ];
    let expr, r, sf = P([3, 3, 4]);
    for (let t = 0; t < 30; t++) { expr = P(templates)(); r = M.evalSteps(expr); if (!r.error && Math.abs(r.result) > 0.5 && Math.abs(r.result) < 100000 && Math.abs(r.result - Math.round(r.result)) > 1e-6) break; }
    const ans = M.roundSF(r.result, sf), shown = show(expr);
    return { q: "Use a calculator: <span class=\"m\">" + shown + "</span>. Give your answer to " + sf + " significant figures.", keys: ["−"], placeholder: "e.g. 12.3",
      check: (s) => near(num(s), ans),
      explain: shown + " = " + clean(M.roundDP(r.result, 8)) + " = " + M.toSF(r.result, sf) + " (" + sf + " s.f.).",
      hint: (s) => (Math.abs(num(s) - r.result) < 1e-6 * Math.abs(r.result) ? "Round your answer to " + sf + " significant figures." : "Use brackets for the top and bottom of any fraction, and don't round until the very end.") };
  });

  M.registerPractice("sensecheck", () => {
    const A = R(2, 9), B = R(2, 9), a = parseFloat((A * (1 + (R(-4, 4)) / 100)).toPrecision(3)), b = parseFloat((B * P([1, 10, 10]) * (1 + R(-4, 4) / 100)).toPrecision(3));
    const mult = Math.random() < 0.7, ok = Math.random() < 0.5;
    const A1 = M.roundSF(a, 1), B1 = M.roundSF(b, 1);
    const real = mult ? a * b : a * b / 1; // quotient built from product
    let calc, estimate, claimed;
    if (mult) { calc = M.fmtNum(a) + " × " + M.fmtNum(b); estimate = A1 * B1; claimed = a * b; }
    else { const prod = parseFloat((a * b).toPrecision(3)); calc = M.fmtNum(prod) + " ÷ " + M.fmtNum(b); estimate = M.roundSF(prod, 1) / B1; claimed = prod / b; }
    const shown = parseFloat(claimed.toPrecision(3)) * (ok ? 1 : P([10, 0.1, 10, 0.01]));
    const shownS = M.fmtNum(parseFloat(shown.toPrecision(3)));
    const sensible = ok;
    const est = mult ? M.fmtNum(A1) + " × " + M.fmtNum(B1) + " = " + M.fmtNum(parseFloat(estimate.toPrecision(6))) : M.fmtNum(M.roundSF(parseFloat((a * b).toPrecision(3)), 1)) + " ÷ " + M.fmtNum(B1) + " = " + M.fmtNum(parseFloat(estimate.toPrecision(6)));
    return { q: "A student's calculator shows <span class=\"m\">" + calc + " = " + shownS + "</span>. Is the answer sensible?", choices: ["Sensible", "Not sensible"],
      check: (s) => s.trim() === (sensible ? "Sensible" : "Not sensible"),
      explain: "Estimate: " + est + ". " + (sensible ? "That is close to " + shownS + ", so it is sensible." : shownS + " is far from the estimate, so it is not sensible. Check what was typed."),
      hint: "Round each number to 1 s.f., work out the estimate, then compare it with the answer shown." };
  });

  M.registerPractice("tconv", () => {
    const to24 = Math.random() < 0.5, t = P([R(0, 23) * 60 + P([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]), 0, 720, 725, 30, 12 * 60 + 30]);
    if (to24) {
      return { q: "Write <span class=\"m\">" + M.fmt12(t) + "</span> in 24-hour time.", keys: [":"], placeholder: "e.g. 15:25",
        check: (s) => /^\d{1,2}[:.]?\d{2}$/.test(s.trim()) && M.parseTime(s) === t && !/[ap]m/i.test(s), explain: M.fmt12(t) + " = " + M.fmt24(t) + ".",
        hint: "Add 12 hours for times after 1 pm. 12 am is 00 and 12 pm stays 12." };
    }
    return { q: "Write <span class=\"m\">" + M.fmt24(t) + "</span> in 12-hour time with am or pm.", keys: [":"], placeholder: "e.g. 3:25 pm",
      check: (s) => /[ap]m/i.test(s) && M.parseTime(s) === t, explain: M.fmt24(t) + " = " + M.fmt12(t) + ".",
      hint: "Take 12 off hours after 12:59 and write pm. 00:xx is 12:xx am, and 12:xx is pm." };
  });

  M.registerPractice("tdur", () => {
    const kind = R(0, 2);
    if (kind === 0) {
      const s = R(5, 20) * 60 + P([0, 5, 10, 15, 20, 30, 40, 45, 50, 55]), d = P([35, 50, 75, 95, 130, 165, 205]), e = s + d;
      return { q: "A film starts at " + M.fmt24(s) + " and ends at " + M.fmt24(e) + ". How long is the film, in minutes?", placeholder: "minutes",
        check: (x) => num(x) === d, explain: M.fmt24(s) + " to " + M.fmt24(e) + " = " + M.durationStr(d) + " = " + d + " minutes.", hint: "Count on to the next whole hour first, then add the rest. 1 hour = 60 minutes." };
    }
    if (kind === 1) {
      const s = R(6, 15) * 60 + P([0, 10, 15, 25, 35, 40, 50]), d = P([45, 70, 85, 110, 135, 150, 190]), e = s + d;
      return { q: "A bus leaves at " + M.fmt24(s) + " and the journey takes " + M.durationStr(d) + ". What time does it arrive? (24-hour time)", keys: [":"], placeholder: "e.g. 14:35",
        check: (x) => /^\d{1,2}[:.]?\d{2}$/.test(x.trim()) && M.parseTime(x) === e % 1440, explain: M.fmt24(s) + " + " + M.durationStr(d) + " = " + M.fmt24(e) + ".", hint: "Add the hours, then the minutes. If the minutes pass 60, carry 1 hour." };
    }
    const stops = ["Britomart", "Newmarket", "Ellerslie", "Penrose", "Otahuhu"], t0 = R(7, 17) * 60 + P([0, 5, 10, 15, 20]);
    const times = [t0]; for (let i = 1; i < stops.length; i++) times.push(times[i - 1] + R(5, 14));
    const i = R(0, 1), j = R(2, 4), dur = times[j] - times[i];
    const rows = stops.map((n, k) => "<tr><td>" + n + "</td><td>" + M.fmt24(times[k]) + "</td></tr>").join("");
    return { q: "Train timetable:<div class=\"tablewrap\"><table class=\"compact\"><thead><tr><th>Station</th><th>Departs</th></tr></thead><tbody>" + rows + "</tbody></table></div>How many minutes does the train take from " + stops[i] + " to " + stops[j] + "?", placeholder: "minutes",
      check: (x) => num(x) === dur, explain: M.fmt24(times[i]) + " to " + M.fmt24(times[j]) + " = " + dur + " minutes.", hint: "Subtract the two times. If the minutes don't work, count on to the next hour." };
  });

  M.registerPractice("clockread", () => {
    const h = R(1, 12), m = P([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, R(1, 59)]);
    const target = (h % 12) * 60 + m;
    return { q: "What time does this clock show? (e.g. 4:35)" + M.clockSVG(h, m, 170), keys: [":"], placeholder: "e.g. 4:35",
      check: (s) => { const v = M.parseTime(s); return v !== null && v % 720 === target % 720; },
      explain: "The short hand is just past " + h + " and the long hand points to " + m + " minutes. So the time = " + h + ":" + (m < 10 ? "0" : "") + m + ".",
      hint: "Read the short hand for the hour, then the long hand for the minutes: each big number is 5 minutes." };
  });

  M.registerPractice("dialread", () => {
    const cfg = P([[100, 20, 4, "km/h"], [10, 2, 0.5, "kg"], [60, 10, 2, "°C"], [200, 50, 10, "mL"]]), steps = Math.round(cfg[0] / cfg[2]);
    const k = R(1, steps - 1), val = parseFloat((k * cfg[2]).toFixed(2));
    return { q: "What does the pointer read? Give the value in " + cfg[3] + "." + M.dialSVG(val, cfg[0], cfg[1], cfg[2], cfg[3], 220), placeholder: "a number",
      check: (s) => near(num(s), val), explain: "Each small division is " + clean(cfg[2]) + " " + cfg[3] + ". The pointer reads " + clean(val) + " " + cfg[3] + ".",
      hint: "Work out what one small division is worth: count the small steps between two labelled numbers, then divide." };
  });

  caUI(); clUI(); duUI();
  M.mountAll();
})();
