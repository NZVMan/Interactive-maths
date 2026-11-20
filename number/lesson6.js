(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const mn = M.minus, R = M.rnd, P = M.pick;
  const near = (x, y) => Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(y));
  const num = (s) => M.parseNumber(String(s).replace(/\s+/g, ""));
  const say = (el, lines) => { el.textContent = ""; lines.forEach((l) => { const d = document.createElement("div"); d.textContent = l; el.appendChild(d); }); };
  const clean = (x) => M.fmtNum(parseFloat(Number(x).toFixed(8)));

  /* ---- 1. Rounding explorer ---- */
  function rdUI() {
    const out = $("rd-out"), raw = $("rd-in").value.trim().replace(/,/g, "").replace(/−/g, "-");
    if (!/^-?(\d+\.?\d*|\.\d+)$/.test(raw) || raw.replace(/\D/g, "").length > 12) return say(out, ["Type a number like 0.0764 or 45678 (up to 12 digits)."]);
    const mode = $("rd-mode").value, n = parseInt($("rd-n").value, 10), neg = raw[0] === "-", s = raw.replace("-", "");
    const pt = s.indexOf(".");
    let keep = -1;
    if (mode === "dp") {
      keep = pt === -1 ? s.length - 1 + 0 : (n === 0 ? pt - 1 : pt + n);
      if (pt === -1) keep = s.length - 1;
    } else {
      let count = 0;
      for (let i = 0; i < s.length; i++) {
        if (s[i] === ".") continue;
        if (count > 0 || s[i] !== "0") count++;
        if (count === n && n > 0) { keep = i; break; }
      }
      if (n === 0) return say(out, ["Choose at least 1 significant figure."]);
      if (keep === -1) keep = s.length - 1;
    }
    const val = parseFloat(raw);
    const result = mode === "dp" ? M.toFixedDP(val, n) : M.toSF(val, n);
    out.textContent = "";
    let dec = -1;
    for (let i = keep + 1; i < s.length; i++) if (s[i] !== ".") { dec = i; break; }
    const line = document.createElement("div");
    if (dec === -1) {
      line.textContent = (neg ? "−" : "") + s + " has no more digits after the last digit you keep, so it is already correct to that accuracy.";
      out.appendChild(line);
    } else {
      const d = parseInt(s[dec], 10);
      const l1 = document.createElement("div");
      l1.appendChild(document.createTextNode("Last digit kept, then the cut, then the deciding digit: " + (neg ? "−" : "") + s.slice(0, keep + 1) + " | " + s.slice(keep + 1, dec)));
      const b = document.createElement("strong"); b.textContent = s[dec]; l1.appendChild(b);
      l1.appendChild(document.createTextNode(s.slice(dec + 1)));
      out.appendChild(l1);
      const l2 = document.createElement("div");
      l2.textContent = "The deciding digit is " + d + ", so " + (d >= 5 ? "round up." : "leave the last digit alone.");
      out.appendChild(l2);
    }
    const ans = document.createElement("div"); const st = document.createElement("strong");
    st.textContent = "Answer: " + mn(result); ans.appendChild(st); out.appendChild(ans);
  }
  ["rd-in", "rd-mode", "rd-n"].forEach((id) => $(id).addEventListener("input", rdUI));

  /* ---- 2. Estimating ---- */
  function oneSF(str) { return M.toSF(parseFloat(str), 1); }
  function esUI() {
    const out = $("es-out"), src = $("es-in").value;
    if (/\^|[a-wyz]/i.test(src)) return say(out, ["Use only numbers, + − × ÷ and brackets."]);
    const rounded = src.replace(/\d+\.?\d*|\.\d+/g, (m) => oneSF(m));
    const lines = [];
    const orig = src.match(/\d+\.?\d*|\.\d+/g) || [], rnd = rounded.match(/\d+\.?\d*|\.\d+/g) || [];
    orig.forEach((o, i) => { if (o !== rnd[i]) lines.push(o + " ≈ " + rnd[i] + " (1 s.f.)"); });
    const r = M.evalSteps(rounded);
    if (r.error) return say(out, [r.error]);
    lines.push("Estimate: " + rounded.replace(/\s+/g, " ") + " = " + mn(clean(r.result)));
    say(out, lines);
  }
  ["38.2 × 9.7", "4.8 × 19.7 ÷ 0.52", "(6.1 + 2.9) × 31", "812 ÷ 19.6", "0.39 × 5.2"].forEach((ex) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = ex;
    b.addEventListener("click", () => { $("es-in").value = ex; esUI(); });
    $("es-ex").appendChild(b);
  });
  $("es-go").addEventListener("click", esUI);
  $("es-in").addEventListener("keydown", (e) => { if (e.key === "Enter") esUI(); });

  /* ---- 4. Bounds ---- */
  const dpFor = (a) => ({ 10: 0, 1: 1, 0.1: 2, 0.01: 3 })[a];
  function bdUI() {
    const out = $("bd-out"), svg = $("bd-svg"), raw = $("bd-v").value.trim().replace(/,/g, "");
    svg.textContent = "";
    if (!/^(\d+\.?\d*|\.\d+)$/.test(raw) || raw.length > 9) return say(out, ["Type a positive number like 12.4."]);
    const v = parseFloat(raw), a = parseFloat($("bd-a").value), half = a / 2, dp = dpFor(a);
    const lo = M.toFixedDP(v - half, dp), hi = M.toFixedDP(v + half, dp);
    say(out, [
      "Accuracy: " + a + ", so go half of that (" + half + ") each way.",
      "Lower bound: " + raw + " − " + half + " = " + lo,
      "Upper bound: " + raw + " + " + half + " = " + hi,
      lo + " ≤ value < " + hi
    ]);
    const ns = "http://www.w3.org/2000/svg";
    const el = (n, at) => { const e = document.createElementNS(ns, n); for (const k in at) e.setAttribute(k, at[k]); return e; };
    const s = el("svg", { viewBox: "0 0 360 90", role: "img", "aria-label": "Number line from " + lo + " to " + hi + " with the value " + raw + " in the middle", width: "100%" });
    s.style.maxWidth = "420px";
    s.appendChild(el("line", { x1: 20, y1: 40, x2: 340, y2: 40, stroke: "currentColor", "stroke-width": 2 }));
    s.appendChild(el("line", { x1: 60, y1: 40, x2: 300, y2: 40, stroke: "var(--accent)", "stroke-width": 6 }));
    s.appendChild(el("circle", { cx: 60, cy: 40, r: 7, fill: "var(--accent)" }));
    s.appendChild(el("circle", { cx: 300, cy: 40, r: 7, fill: "var(--card)", stroke: "var(--accent)", "stroke-width": 3 }));
    s.appendChild(el("line", { x1: 180, y1: 30, x2: 180, y2: 50, stroke: "currentColor", "stroke-width": 2 }));
    [[60, lo], [180, raw], [300, hi]].forEach((p) => { const t = el("text", { x: p[0], y: 72, "text-anchor": "middle", fill: "currentColor", "font-size": 16 }); t.textContent = p[1]; s.appendChild(t); });
    const c1 = el("text", { x: 60, y: 22, "text-anchor": "middle", fill: "currentColor", "font-size": 13 }); c1.textContent = "included"; s.appendChild(c1);
    const c2 = el("text", { x: 300, y: 22, "text-anchor": "middle", fill: "currentColor", "font-size": 13 }); c2.textContent = "not included"; s.appendChild(c2);
    svg.appendChild(s);
  }
  ["bd-v", "bd-a"].forEach((id) => $(id).addEventListener("input", bdUI));

  /* ---- Practice ---- */
  M.registerPractice("rdp", () => {
    const dp = P([0, 1, 2, 2, 3]), kind = R(0, 3);
    let x;
    if (kind === 0) x = parseFloat(M.shiftDecimal(String(R(10000, 99999)), -4));
    else if (kind === 1) x = parseFloat(M.shiftDecimal(String(R(100, 999)), -4));
    else if (kind === 2) x = parseFloat((R(1, 9) + 0.995 + R(0, 3) * 0.001).toFixed(4));
    else x = parseFloat(M.shiftDecimal(String(R(100000, 999999)), -3));
    const ans = M.roundDP(x, dp), s = M.fmtNum(x);
    return { q: "Round <span class=\"m\">" + s + "</span> to " + dp + " decimal place" + (dp === 1 ? "" : "s") + ".", placeholder: "e.g. 3.46",
      check: (a) => near(num(a), ans), explain: s + " to " + dp + " d.p. = " + M.toFixedDP(x, dp) + ".",
      hint: "Count " + dp + " place" + (dp === 1 ? "" : "s") + " after the point, then look at the next digit: 5 or more rounds up." };
  });
  M.registerPractice("rsf", () => {
    const sf = P([1, 2, 2, 3]), kind = R(0, 3);
    let x;
    if (kind === 0) x = parseFloat(M.shiftDecimal(String(R(10000, 99999)), -R(0, 2)));
    else if (kind === 1) x = parseFloat(M.shiftDecimal(String(R(1000, 9999)), -R(4, 6)));
    else if (kind === 2) x = R(1000, 99999) * P([10, 100]);
    else x = parseFloat(M.shiftDecimal(String(R(100000, 999999)), -R(1, 4)));
    const ans = M.roundSF(x, sf), s = M.fmtNum(x);
    return { q: "Round <span class=\"m\">" + s + "</span> to " + sf + " significant figure" + (sf === 1 ? "" : "s") + ".", placeholder: "e.g. 0.076",
      check: (a) => near(num(a), ans), explain: s + " to " + sf + " s.f. = " + M.toSF(x, sf) + ".",
      hint: "Start counting at the first digit that is not zero. Then look at the next digit: 5 or more rounds up. Fill the gap with zeros if the number is large." };
  });
  M.registerPractice("estimate", () => {
    const sfv = () => R(2, 9) * Math.pow(10, P([-1, 0, 0, 1, 2]));
    const makeNear = (A) => {
      for (let t = 0; t < 40; t++) {
        const v = parseFloat((A * (1 + (Math.random() * 0.08 - 0.04))).toPrecision(3));
        if (M.roundSF(v, 1) === A && v !== A) return v;
      }
      return A;
    };
    let q, ans, why;
    for (let tries = 0; tries < 60; tries++) {
      const A = sfv(), B = sfv(), C = P([2, 4, 5]) * Math.pow(10, P([-1, 0, 0, 1]));
      const a = makeNear(A), b = makeNear(B), c = makeNear(C), form = R(0, 3);
      const f = (x) => M.fmtNum(x), g = (x) => M.fmtNum(x);
      let sa, sr;
      if (form === 0) { sa = f(a) + " × " + f(b); sr = g(A) + " × " + g(B); }
      else if (form === 1) { sa = f(a) + " × " + f(b) + " ÷ " + f(c); sr = g(A) + " × " + g(B) + " ÷ " + g(C); }
      else if (form === 2) { sa = "(" + f(a) + " + " + f(b) + ") × " + f(c); sr = "(" + g(A) + " + " + g(B) + ") × " + g(C); }
      else { sa = f(a * B) + " ÷ " + f(c); sr = g(M.roundSF(a * B, 1)) + " ÷ " + g(C); }
      if (form === 3) { const top = parseFloat((A * B * (1 + (Math.random() * 0.06 - 0.03))).toPrecision(3)); if (M.roundSF(top, 1) !== A * B && M.roundSF(top, 1) !== M.roundSF(A * B, 1)) continue; sa = f(top) + " ÷ " + f(c); sr = g(M.roundSF(top, 1)) + " ÷ " + g(C); }
      const r = M.evalSteps(sr);
      if (r.error || !isFinite(r.result)) continue;
      const rr = parseFloat(r.result.toFixed(8));
      if (Math.abs(rr) > 20000 || Math.abs(rr * 100 - Math.round(rr * 100)) > 1e-6) continue;
      const orig = sa.match(/\d+\.?\d*|\.\d+/g), rnd = sr.match(/\d+\.?\d*|\.\d+/g);
      const notes = orig.map((o, i) => o + " ≈ " + rnd[i]).filter((t, i) => orig[i] !== rnd[i]);
      q = sa; ans = rr; why = (notes.length ? notes.join(", ") + ". " : "") + sr + " = " + clean(rr) + ".";
      break;
    }
    return { q: "Estimate <span class=\"m\">" + q + "</span> by rounding each number to 1 significant figure.", placeholder: "e.g. 200", keys: [],
      check: (s) => near(num(s), ans), explain: why, hint: "Round every number to 1 s.f. first (the first digit that isn't zero), then do the easy calculation." };
  });
  M.registerPractice("rdcontext", () => {
    const kind = R(0, 2);
    if (kind === 0) {
      const n = P([3, 6, 7]), cents = R(2000, 9000), total = cents / 100, each = total / n;
      const ans = M.roundDP(each, 2);
      return { q: "$" + total.toFixed(2) + " is shared equally between " + n + " friends. How many dollars does each get, to the nearest cent? (Type the number only.)", placeholder: "e.g. 12.35",
        check: (s) => near(num(s), ans), explain: total.toFixed(2) + " ÷ " + n + " = " + each.toFixed(5).replace(/0+$/, "") + ", which is $" + ans.toFixed(2) + " to the nearest cent.", hint: "Money is rounded to 2 decimal places." };
    }
    if (kind === 1) {
      const seats = P([12, 15, 25]), s = R(40, 120);
      const ans = Math.ceil(s / seats);
      return { q: "A school trip has " + s + " students. Each minibus holds " + seats + " students. How many minibuses are needed?", placeholder: "whole number",
        check: (x) => num(x) === ans, explain: s + " ÷ " + seats + " = " + (s / seats).toFixed(2) + ", so round up to " + ans + " minibuses.", hint: (x) => (num(x) === Math.floor(s / seats) ? "Rounding down would leave some students behind. Round up." : "Divide, then round up to a whole number of buses.") };
    }
    const per = P([6, 8, 10]), t = R(30, 95);
    const ans = Math.ceil(t / per);
    return { q: "Tiles come in packs of " + per + ". You need " + t + " tiles. How many packs do you buy?", placeholder: "whole number",
      check: (x) => num(x) === ans, explain: t + " ÷ " + per + " = " + (t / per).toFixed(2) + ", so round up to " + ans + " packs.", hint: "You can't buy part of a pack, and you need enough tiles. Round up." };
  });
  M.registerPractice("bounds", () => {
    const which = P(["lower", "upper"]), a = P([10, 1, 0.1, 0.01]);
    const dpv = { 10: 0, 1: 0, 0.1: 1, 0.01: 2 }[a];
    const v = a === 10 ? R(2, 99) * 10 : parseFloat(M.shiftDecimal(String(R(20, 999)), -dpv));
    const half = a / 2, d = dpFor(a);
    const lo = parseFloat((v - half).toFixed(d)), hi = parseFloat((v + half).toFixed(d));
    const unit = P(["cm", "kg", "m", "seconds"]);
    const acc = { 10: "nearest 10", 1: "nearest whole number", 0.1: "1 decimal place", 0.01: "2 decimal places" }[a];
    const ans = which === "lower" ? lo : hi;
    return { q: "A measurement is <span class=\"m\">" + M.fmtNum(v) + " " + unit + "</span> to the " + acc + ". Write its " + which + " bound.", placeholder: "e.g. 12.35",
      check: (s) => near(num(s), ans),
      explain: "Half of " + a + " is " + half + ". " + M.fmtNum(v) + (which === "lower" ? " − " : " + ") + half + " = " + clean(ans) + ".",
      hint: (s) => { const x = num(s); return (which === "lower" && near(x, hi)) || (which === "upper" && near(x, lo)) ? "That's the other bound. Lower means smaller, upper means bigger." : "Go half of the accuracy (" + half + ") " + (which === "lower" ? "below" : "above") + " the value."; } };
  });

  rdUI(); esUI(); bdUI();
  M.mountAll();
})();
