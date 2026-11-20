(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const mn = M.minus, R = M.rnd, P = M.pick;
  const near = (x, y) => Math.abs(x - y) <= 1e-6 * Math.max(1, Math.abs(y));
  const num = (s) => M.parseNumber(String(s).replace(/\s+/g, ""));
  const clean = (x) => M.fmtNum(parseFloat(Number(x).toFixed(6)));
  const say = (el, lines) => { el.textContent = ""; lines.forEach((l) => { const d = document.createElement("div"); d.textContent = l; el.appendChild(d); }); };
  const parseRatio = (s) => {
    const parts = String(s).replace(/\s*to\s*/gi, ":").split(/[:,\s]+/).filter(Boolean);
    if (parts.length < 2 || parts.length > 4 || !parts.every((p) => /^\d+$/.test(p))) return null;
    return parts.map(Number);
  };
  const simplifyRatio = (r) => { const g = r.reduce((a, b) => M.gcd(a, b)); return r.map((x) => x / g); };

  /* ---- 1. Ratio ---- */
  function raUI() {
    const out = $("ra-out"), bar = $("ra-bar"), t = parseFloat($("ra-t").value.replace(/,/g, "")), r = parseRatio($("ra-r").value);
    bar.textContent = "";
    if (!(t > 0) || !r || r.some((x) => x === 0)) return say(out, ["Type a total, and a ratio like 2:3 or 1:2:5 (whole numbers, 2 to 4 parts)."]);
    const parts = r.reduce((a, b) => a + b, 0), one = t / parts;
    say(out, [
      "Add the parts: " + r.join(" + ") + " = " + parts + ".",
      "One part: " + clean(t) + " ÷ " + parts + " = " + clean(one) + ".",
      "Shares: " + r.map((x) => x + " × " + clean(one) + " = " + clean(M.roundDP(x * one, 4))).join(",  ")
    ]);
    const b = document.createElement("div"); b.className = "ratiobar";
    r.forEach((x) => { const s = document.createElement("span"); s.style.flexGrow = String(x); s.textContent = clean(M.roundDP(x * one, 2)); b.appendChild(s); });
    bar.appendChild(b);
  }
  ["ra-t", "ra-r"].forEach((id) => $(id).addEventListener("input", raUI));

  /* ---- 2. Proportion ---- */
  function prUI() {
    const out = $("pr-out"), k = $("pr-k").value, v = ["pr-a1", "pr-b1", "pr-a2"].map((id) => parseFloat($(id).value));
    if (v.some((x) => !(x > 0))) return say(out, ["Type positive numbers in all three boxes."]);
    const [a1, b1, a2] = v;
    if (k === "d") {
      const u = b1 / a1;
      say(out, ["Direct: find B for 1 of A. " + clean(b1) + " ÷ " + clean(a1) + " = " + clean(u) + ".", "Then multiply by the new A: " + clean(u) + " × " + clean(a2) + " = " + clean(a2 * u) + ".", "New B = " + clean(a2 * u)]);
    } else {
      const c = a1 * b1;
      say(out, ["Inverse: A × B stays the same. " + clean(a1) + " × " + clean(b1) + " = " + clean(c) + ".", "Then divide by the new A: " + clean(c) + " ÷ " + clean(a2) + " = " + clean(c / a2) + ".", "New B = " + clean(c / a2)]);
    }
  }
  ["pr-k", "pr-a1", "pr-b1", "pr-a2"].forEach((id) => $(id).addEventListener("input", prUI));

  /* ---- 3. Speed ---- */
  function spUI() {
    const out = $("sp-out"), ids = ["sp-d", "sp-t", "sp-s"], raw = ids.map((id) => $(id).value.trim()), blank = raw.filter((x) => x === "").length;
    if (blank !== 1) return say(out, ["Fill in exactly two boxes and leave one blank."]);
    const v = raw.map((x) => (x === "" ? null : parseFloat(x)));
    if (v.some((x) => x !== null && !(x > 0))) return say(out, ["Use positive numbers."]);
    const [d, t, s] = v;
    if (d === null) say(out, ["distance = speed × time", clean(s) + " × " + clean(t) + " = " + clean(s * t) + " km"]);
    else if (t === null) say(out, ["time = distance ÷ speed", clean(d) + " ÷ " + clean(s) + " = " + clean(d / s) + " hours", "(" + clean(M.roundDP(d / s * 60, 1)) + " minutes)"]);
    else say(out, ["speed = distance ÷ time", clean(d) + " ÷ " + clean(t) + " = " + clean(d / t) + " km/h"]);
  }
  ids3 = ["sp-d", "sp-t", "sp-s"]; var ids3;
  ids3.forEach((id) => $(id).addEventListener("input", spUI));

  /* ---- 4. Scale ---- */
  function scUI() {
    const out = $("sc-out"), n = parseFloat($("sc-n").value.replace(/[,\s]/g, "")), l = parseFloat($("sc-l").value);
    if (!(n >= 1) || !(l > 0)) return say(out, ["Type a scale like 50000 and a length in cm."]);
    const cm = n * l;
    say(out, ["Multiply by the scale: " + clean(l) + " × " + M.fmtNum(n) + " = " + M.fmtNum(parseFloat(cm.toFixed(6))) + " cm.",
      "In metres: ÷ 100 = " + clean(cm / 100) + " m.", "In kilometres: ÷ 100 000 = " + clean(cm / 100000) + " km."]);
  }
  ["sc-n", "sc-l"].forEach((id) => $(id).addEventListener("input", scUI));

  /* ---- Practice ---- */
  M.registerPractice("ratio", () => {
    const kind = R(0, 3);
    if (kind === 0) {
      const base = [[1, 2], [2, 3], [3, 4], [2, 5], [3, 5], [1, 3], [3, 7]], b = P(base), m = R(2, 9);
      const q = [b[0] * m, b[1] * m];
      return { q: "Write the ratio <span class=\"m\">" + q[0] + " : " + q[1] + "</span> in its simplest form.", keys: [":"], placeholder: "e.g. 2:3",
        check: (s) => { const r = parseRatio(s); return !!r && r.length === 2 && r[0] === b[0] && r[1] === b[1]; },
        explain: "Divide both by " + m + ": " + q[0] + " : " + q[1] + " = " + b[0] + " : " + b[1] + ".",
        hint: (s) => { const r = parseRatio(s); return r && r.length === 2 && r[0] * b[1] === r[1] * b[0] ? "Right ratio, but not simplest yet. Divide both parts by their HCF." : "Divide both parts by the same number (their HCF)."; } };
    }
    if (kind === 1) {
      const opts = [[30, 0.9, 1, 3, "30 cm : 0.9 m", "30 : 90"], [250, 1, 1, 4, "250 mL : 1 L", "250 : 1000"], [75, 3, 1, 4, "75 cents : $3", "75 : 300"], [45, 1.5, 1, 2, "45 minutes : 1.5 hours", "45 : 90"]];
      const o = P(opts);
      return { q: "Write the ratio <span class=\"m\">" + o[4] + "</span> in its simplest form.", keys: [":"], placeholder: "e.g. 1:3",
        check: (s) => { const r = parseRatio(s); return !!r && r.length === 2 && r[0] === o[2] && r[1] === o[3]; },
        explain: o[4] + " = " + o[5] + " (same units) = " + o[2] + " : " + o[3] + ".", hint: "Both parts must be in the same unit before you simplify." };
    }
    const r = P([[2, 3], [1, 4], [3, 5], [2, 7], [1, 2, 3], [2, 3, 5], [1, 1, 2]]), parts = r.reduce((a, b) => a + b, 0), one = R(3, 14) * P([1, 2, 5]);
    const total = one * parts, pick = R(0, r.length - 1), names = ["Ana", "Ben", "Cam"];
    const nm = r.length === 2 ? ["Ana", "Ben"] : names;
    const ratioTxt = r.join(" : ");
    return { q: nm.join(", ") + " share $" + total + " in the ratio <span class=\"m\">" + ratioTxt + "</span>. How many dollars does " + nm[pick] + " get?", placeholder: "e.g. 24",
      check: (s) => near(num(s), r[pick] * one),
      explain: r.join(" + ") + " = " + parts + " parts. One part = " + total + " ÷ " + parts + " = " + one + ". " + nm[pick] + " gets " + r[pick] + " × " + one + " = " + r[pick] * one + ".",
      hint: "Add the parts, divide the total by that to find one part, then multiply by " + nm[pick] + "'s number." };
  });

  M.registerPractice("proportion", () => {
    const kind = R(0, 2);
    if (kind === 0) {
      const u = P([1.2, 1.5, 2.4, 3.5, 0.8, 4.2]), n1 = R(3, 8), n2 = R(9, 20), c1 = parseFloat((u * n1).toFixed(2)), ans = parseFloat((u * n2).toFixed(2));
      return { q: n1 + " notebooks cost $" + c1.toFixed(2) + ". How many dollars do " + n2 + " notebooks cost?", placeholder: "e.g. 18.50",
        check: (s) => near(num(s), ans), explain: "One notebook: " + c1.toFixed(2) + " ÷ " + n1 + " = " + clean(u) + ". Then " + clean(u) + " × " + n2 + " = " + clean(ans) + ".",
        hint: "Direct proportion. Find the cost of 1 notebook first, then multiply." };
    }
    if (kind === 1) {
      const w1 = P([4, 6, 8, 9, 12]), d1 = R(3, 10), k = w1 * d1, divs = [];
      for (let w = 2; w <= 24; w++) if (k % w === 0 && w !== w1) divs.push(w);
      const w2 = P(divs), ans = k / w2;
      return { q: w1 + " workers take " + d1 + " days to paint a fence. How many days would " + w2 + " workers take?", placeholder: "e.g. 8",
        check: (s) => near(num(s), ans), explain: w1 + " × " + d1 + " = " + k + " worker-days. " + k + " ÷ " + w2 + " = " + clean(ans) + " days.",
        hint: "Inverse proportion: more workers means fewer days. Multiply workers × days (it stays the same), then divide by the new number of workers." };
    }
    const kmh = P([40, 60, 80, 90]), t1 = P([3, 4, 6]), k = kmh * t1, ts = [2, 2.5, 3, 4, 5, 6, 8, 10, 12].filter((t) => Number.isInteger(k / t * 100) && t !== t1), t2 = P(ts), ans = k / t2;
    return { q: "A car at " + kmh + " km/h takes " + t1 + " hours for a trip. How long (in hours) would it take at " + clean(ans) + " km/h?", placeholder: "e.g. 3",
      check: (s) => near(num(s), t2), explain: kmh + " × " + t1 + " = " + k + " km. " + k + " ÷ " + clean(ans) + " = " + clean(t2) + " hours.",
      hint: "Speed and time are in inverse proportion. Find the distance first (speed × time), then divide by the new speed." };
  });

  M.registerPractice("rates", () => {
    const kind = R(0, 6);
    if (kind === 0) {
      const t = P([1.5, 2, 2.5, 3, 4]), v = R(4, 18) * 5;
      return { q: "A cyclist rides " + clean(v * t) + " km in " + clean(t) + " hours. What is the average speed in km/h?", placeholder: "e.g. 24",
        check: (s) => near(num(s), v), explain: clean(v * t) + " ÷ " + clean(t) + " = " + v + " km/h.", hint: "speed = distance ÷ time" };
    }
    if (kind === 1) {
      const t = P([0.5, 1.5, 2, 2.5, 3]), v = R(4, 16) * 5;
      return { q: "A train travels at " + v + " km/h for " + clean(t) + " hours. How far does it go, in km?", placeholder: "e.g. 150",
        check: (s) => near(num(s), v * t), explain: v + " × " + clean(t) + " = " + clean(v * t) + " km.", hint: "distance = speed × time" };
    }
    if (kind === 2) {
      const v = P([40, 60, 80, 90]), t = P([0.5, 1.5, 2, 2.5, 3]);
      return { q: "A bus travels " + clean(v * t) + " km at " + v + " km/h. How many hours does it take?", placeholder: "e.g. 2.5",
        check: (s) => near(num(s), t), explain: clean(v * t) + " ÷ " + v + " = " + clean(t) + " hours.", hint: "time = distance ÷ speed" };
    }
    if (kind === 3) {
      const T = P([2, 2.5, 4, 5]), v = R(8, 18) * 5, D = v * T, d1 = R(4, Math.floor(D / 10) - 2) * 5 + 10, d2 = D - d1, t1 = P([0.5, 1, 1.5]), t2 = T - t1;
      return { q: "A van travels " + d1 + " km in " + clean(t1) + " hours, then " + d2 + " km in " + clean(t2) + " hours. What is its average speed for the whole journey, in km/h?", placeholder: "e.g. 60",
        check: (s) => near(num(s), v), explain: "Total distance " + d1 + " + " + d2 + " = " + D + " km. Total time " + clean(t1) + " + " + clean(t2) + " = " + clean(T) + " hours. " + D + " ÷ " + clean(T) + " = " + v + " km/h.",
        hint: "Average speed = total distance ÷ total time. Don't average the two speeds." };
    }
    if (kind === 4) {
      const d = P([2, 2.5, 4, 5, 8, 10, 12.5]), vol = R(3, 12) * 10, m = parseFloat((d * vol).toFixed(2));
      return { q: "A metal block has mass " + clean(m) + " g and volume " + vol + " cm³. Density = mass ÷ volume. Find the density in g/cm³.", placeholder: "e.g. 7.8",
        check: (s) => near(num(s), d), explain: clean(m) + " ÷ " + vol + " = " + clean(d) + " g/cm³.", hint: "density = mass ÷ volume" };
    }
    if (kind === 5) {
      const a = P([0.5, 2, 4, 5]), p = R(4, 40) * 5, f = p * a;
      return { q: "A force of " + clean(f) + " N acts on an area of " + clean(a) + " m². Pressure = force ÷ area. Find the pressure in N/m².", placeholder: "e.g. 60",
        check: (s) => near(num(s), p), explain: clean(f) + " ÷ " + clean(a) + " = " + p + " N/m².", hint: "pressure = force ÷ area" };
    }
    const mins = P([20, 30, 45, 90, 150]), v = P([24, 36, 48, 60, 72]), d = v * mins / 60;
    return { q: "A scooter travels at " + v + " km/h for " + mins + " minutes. How far does it go, in km?", placeholder: "e.g. 18",
      check: (s) => near(num(s), d), explain: mins + " min = " + clean(mins / 60) + " h. " + v + " × " + clean(mins / 60) + " = " + clean(d) + " km.", hint: "Change the minutes to hours first (divide by 60)." };
  });

  M.registerPractice("scale", () => {
    const kind = R(0, 2), nn = P([10000, 25000, 50000, 100000]);
    if (kind === 0) {
      const l = nn === 25000 ? P([2, 4, 6, 10]) : R(2, 12), km = l * nn / 100000;
      return { q: "On a map with scale <span class=\"m\">1 : " + M.fmtNum(nn) + "</span>, two towns are " + l + " cm apart. How far apart are they in real life, in km?", placeholder: "e.g. 2.5",
        check: (s) => near(num(s), km), explain: l + " × " + M.fmtNum(nn) + " = " + M.fmtNum(l * nn) + " cm = " + clean(km) + " km.", hint: "Multiply by the scale to get cm, then divide by 100 000 to get km." };
    }
    if (kind === 1) {
      const l = nn === 25000 ? P([2, 4, 6, 10]) : R(2, 12), km = l * nn / 100000;
      return { q: "A walking track is " + clean(km) + " km long. How long is it on a map with scale <span class=\"m\">1 : " + M.fmtNum(nn) + "</span>, in cm?", placeholder: "e.g. 6",
        check: (s) => near(num(s), l), explain: clean(km) + " km = " + M.fmtNum(km * 100000) + " cm. " + M.fmtNum(km * 100000) + " ÷ " + M.fmtNum(nn) + " = " + l + " cm.", hint: "Change km to cm (× 100 000), then divide by the scale." };
    }
    const n = P([20, 50, 100]), m = R(2, 9) * (n === 20 ? 5 : 1), real = m * n / 100;
    return { q: "A model of a boat is built to scale <span class=\"m\">1 : " + n + "</span>. The model is " + m + " cm long. How long is the real boat, in metres?", placeholder: "e.g. 12",
      check: (s) => near(num(s), real), explain: m + " × " + n + " = " + M.fmtNum(m * n) + " cm = " + clean(real) + " m.", hint: "Multiply by the scale to get cm, then divide by 100 to get metres." };
  });

  raUI(); prUI(); spUI(); scUI();
  M.mountAll();
})();
