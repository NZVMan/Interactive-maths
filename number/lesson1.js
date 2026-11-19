(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const SET_LABELS = [
    ["natural", "Natural"], ["integer", "Integer"], ["rational", "Rational"], ["irrational", "Irrational"],
    ["real", "Real"], ["prime", "Prime"], ["square", "Square"], ["cube", "Cube"]
  ];

  /* ---- 1. Classifier ---- */
  function classifyUI() {
    const out = $("cls-out");
    out.textContent = "";
    const r = M.classify($("cls-in").value);
    if (!r) return;
    if (r.error) { const p = document.createElement("p"); p.textContent = r.error; out.appendChild(p); return; }
    const h = document.createElement("p");
    h.innerHTML = "<strong></strong> is in these families:";
    h.firstChild.textContent = r.label;
    out.appendChild(h);
    const chips = document.createElement("div");
    chips.className = "chips";
    SET_LABELS.forEach(([key, name]) => {
      const c = document.createElement("span");
      c.className = "chip" + (r.sets[key] ? " on" : "");
      c.textContent = name;
      chips.appendChild(c);
    });
    out.appendChild(chips);
    if (r.sets.irrational) {
      const p = document.createElement("p");
      p.textContent = "It is irrational, so its decimal never ends and never repeats (about " + r.value.toFixed(6) + "…).";
      out.appendChild(p);
    } else if (!Number.isInteger(r.value)) {
      const p = document.createElement("p");
      p.textContent = "As a decimal it is " + M.fmtNum(r.value) + ", which stops or repeats, so it is rational.";
      out.appendChild(p);
    }
  }
  const SAMPLES = ["7", "−3", "0", "49", "64", "91", "0.25", "3/4", "√2", "√49", "π", "−5/2", "1/3"];
  $("cls-go").addEventListener("click", classifyUI);
  $("cls-in").addEventListener("keydown", (e) => { if (e.key === "Enter") classifyUI(); });
  $("cls-rand").addEventListener("click", () => { $("cls-in").value = M.pick(SAMPLES); classifyUI(); });
  classifyUI();

  /* ---- 2. Factor tree ---- */
  function buildTree(n) {
    const li = document.createElement("li");
    const node = document.createElement("span");
    node.className = "node" + (M.isPrime(n) ? " prime" : "");
    node.textContent = n;
    li.appendChild(node);
    if (!M.isPrime(n)) {
      const p = M.primeFactors(n)[0];
      const ul = document.createElement("ul");
      ul.appendChild(buildTree(p));
      ul.appendChild(buildTree(n / p));
      li.appendChild(ul);
    }
    return li;
  }
  function treeUI() {
    const n = parseInt($("tree-n").value, 10);
    const out = $("tree-out"), prod = $("tree-prod");
    out.textContent = ""; prod.textContent = "";
    if (!(n >= 2 && n <= 9999)) { prod.textContent = "Pick a whole number from 2 to 9999."; return; }
    const ul = document.createElement("ul");
    ul.appendChild(buildTree(n));
    out.appendChild(ul);
    if (M.isPrime(n)) prod.textContent = n + " is prime, so it can't be split.";
    else {
      const plain = M.primeFactors(n).join(" × "), idx = M.factorString(n);
      prod.textContent = n + " = " + plain + (idx !== plain ? " = " + idx : "");
    }
  }
  $("tree-go").addEventListener("click", treeUI);
  $("tree-n").addEventListener("keydown", (e) => { if (e.key === "Enter") treeUI(); });
  treeUI();

  /* ---- 3. HCF / LCM diagram ---- */
  function hlUI() {
    const a = parseInt($("a-in").value, 10), b = parseInt($("b-in").value, 10);
    const out = $("venn-out"), txt = $("hl-text");
    out.textContent = ""; txt.textContent = "";
    if (!(a >= 2 && a <= 999 && b >= 2 && b <= 999)) { txt.textContent = "Pick two whole numbers from 2 to 999."; return; }
    const ca = M.factorCounts(a), cb = M.factorCounts(b);
    const primes = Array.from(new Set(Object.keys(ca).concat(Object.keys(cb)))).map(Number).sort((x, y) => x - y);
    const left = [], mid = [], right = [];
    primes.forEach((p) => {
      const x = ca[p] || 0, y = cb[p] || 0, c = Math.min(x, y);
      for (let i = 0; i < c; i++) mid.push(p);
      for (let i = 0; i < x - c; i++) left.push(p);
      for (let i = 0; i < y - c; i++) right.push(p);
    });
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 460 240");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Prime factors of " + a + " and " + b);
    function el(name, attrs, text) {
      const e = document.createElementNS(NS, name);
      Object.keys(attrs).forEach((k) => e.setAttribute(k, attrs[k]));
      if (text !== undefined) e.textContent = text;
      return e;
    }
    svg.appendChild(el("circle", { cx: 170, cy: 120, r: 100, style: "fill: var(--soft); stroke: var(--accent); stroke-width: 2; fill-opacity: .8" }));
    svg.appendChild(el("circle", { cx: 290, cy: 120, r: 100, style: "fill: var(--hi); stroke: var(--accent); stroke-width: 2; fill-opacity: .35" }));
    svg.appendChild(el("text", { x: 120, y: 18, "text-anchor": "middle", style: "fill: var(--ink); font-weight: 700" }, String(a)));
    svg.appendChild(el("text", { x: 340, y: 18, "text-anchor": "middle", style: "fill: var(--ink); font-weight: 700" }, String(b)));
    function list(arr, cx) {
      const lines = [];
      for (let i = 0; i < arr.length; i += 3) lines.push(arr.slice(i, i + 3).join("  "));
      lines.forEach((l, i) => svg.appendChild(el("text", { x: cx, y: 120 - (lines.length - 1) * 11 + i * 22 + 6, "text-anchor": "middle", style: "fill: var(--ink); font-size: 18px; font-weight: 600" }, l)));
    }
    list(left, 100); list(mid, 230); list(right, 360);
    out.appendChild(svg);
    const hcf = mid.reduce((x, y) => x * y, 1);
    const lcm = hcf * left.reduce((x, y) => x * y, 1) * right.reduce((x, y) => x * y, 1);
    txt.innerHTML = "";
    const l1 = document.createElement("div"), l2 = document.createElement("div");
    l1.innerHTML = "<strong>HCF</strong> = " + (mid.length ? mid.join(" × ") + " = " : "(nothing shared) = ") + hcf;
    l2.innerHTML = "<strong>LCM</strong> = " + (mid.concat(left, right).join(" × ")) + " = " + lcm;
    txt.appendChild(l1); txt.appendChild(l2);
  }
  $("hl-go").addEventListener("click", hlUI);
  ["a-in", "b-in"].forEach((id) => $(id).addEventListener("keydown", (e) => { if (e.key === "Enter") hlUI(); }));
  hlUI();

  /* ---- Practice ---- */
  M.registerPractice("isprime", () => {
    const n = M.rnd(20, 99);
    const prime = M.isPrime(n);
    return {
      q: "Is <strong>" + n + "</strong> a prime number? (yes or no)",
      check: (s) => { s = s.trim().toLowerCase(); return prime ? ["y", "yes"].includes(s) : ["n", "no"].includes(s); },
      explain: prime ? n + " has no factors except 1 and itself." : n + " = " + M.primeFactors(n).join(" × ") + ", so it has other factors.",
      hint: "Try dividing by 2, 3, 5 and 7. If any divides exactly, it isn't prime."
    };
  });
  M.registerPractice("factorise", () => {
    const pool = [2, 2, 3, 3, 5, 7];
    let n;
    do { n = 1; const k = M.rnd(3, 5); for (let i = 0; i < k; i++) n *= M.pick(pool); } while (n > 400 || n < 12 || M.isPrime(n));
    const target = M.factorCounts(n);
    return {
      q: "Write <strong>" + n + "</strong> as a product of prime factors.",
      check: (s) => { const m = M.parseFactorProduct(s); return !!m && M.sameCounts(m, target) && Object.keys(m).every((p) => M.isPrime(+p)); },
      explain: n + " = " + M.factorString(n) + ".",
      hint: "Keep splitting until every factor is prime. Write repeats as powers, like 2^3 x 5."
    };
  });
  M.registerPractice("hcflcm", () => {
    const g = M.pick([2, 3, 4, 5, 6]), x = M.pick([2, 3, 4, 5, 7]);
    let y = M.pick([3, 4, 5, 6, 7, 9]);
    if (y === x) y += 1;
    const a = g * x, b = g * y;
    const wantHcf = Math.random() < 0.5;
    const ans = wantHcf ? M.gcd(a, b) : M.lcm(a, b);
    return {
      q: "Find the <strong>" + (wantHcf ? "HCF" : "LCM") + "</strong> of <strong>" + a + "</strong> and <strong>" + b + "</strong>.",
      check: (s) => M.parseNumber(s) === ans,
      explain: a + " = " + M.factorString(a) + " and " + b + " = " + M.factorString(b) + ", so the " + (wantHcf ? "HCF" : "LCM") + " is " + ans + ".",
      hint: wantHcf ? "Write both as products of primes and multiply the primes they share." : "Write both as products of primes and multiply everything in the diagram (shared primes once)."
    };
  });

  M.mountAll();
})();
