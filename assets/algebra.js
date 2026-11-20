/* Algebra helpers: parse, expand, format, factor-check, formula-subject check, equation solving.
   Browser: window.A.  Node: module.exports.  Plain JavaScript, no dependencies. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.A = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  const SUP = { "⁰": 0, "¹": 1, "²": 2, "³": 3, "⁴": 4, "⁵": 5, "⁶": 6, "⁷": 7, "⁸": 8, "⁹": 9 };
  const SUPCH = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  const sup = (n) => String(n).split("").map((c) => (c === "-" ? "⁻" : SUPCH[+c])).join("");
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a; };
  const MINUS = "−";
  const fmt = (x) => { const r = Math.round(x * 1e9) / 1e9; return String(r).replace("-", MINUS); };

  /* ---------- tokeniser and parser ---------- */
  function normalise(s) {
    s = String(s).replace(/[−–—]/g, "-").replace(/[×·*]/g, "*").replace(/÷/g, "/").replace(/\s+/g, "");
    s = s.replace(/√/g, "sqrt").replace(/π/g, "π");
    s = s.replace(/(⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (m) => "^" + (m[0] === "⁻" ? "(-" + m.slice(1).split("").map((c) => SUP[c]).join("") + ")" : m.split("").map((c) => SUP[c]).join("")));
    return s;
  }
  function tokenise(s) {
    const t = []; let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\d/.test(c) || (c === "." && /\d/.test(s[i + 1] || ""))) { let j = i; while (j < s.length && /[\d.]/.test(s[j])) j++; const v = parseFloat(s.slice(i, j)); if (isNaN(v)) throw new Error("number"); t.push({ k: "n", v }); i = j; }
      else if (s.startsWith("sqrt", i)) { t.push({ k: "f", v: "sqrt" }); i += 4; }
      else if (/[a-zA-Zπ]/.test(c)) { t.push({ k: "v", v: c }); i++; }
      else if ("+-*/^()".includes(c)) { t.push({ k: c }); i++; }
      else throw new Error("character " + c);
    }
    return t;
  }
  function parse(src) {
    const toks = tokenise(normalise(src)); let p = 0;
    const peek = () => toks[p], eat = (k) => { if (peek() && peek().k === k) return toks[p++]; return null; };
    const startsFactor = (t) => t && (t.k === "v" || t.k === "(" || t.k === "f");
    function expr() { let a = term(); for (;;) { if (eat("+")) a = { t: "bin", op: "+", a, b: term() }; else if (eat("-")) a = { t: "bin", op: "-", a, b: term() }; else return a; } }
    function chain() { let a = unary(); while (startsFactor(peek())) a = { t: "bin", op: "*", a, b: power(), implicit: true }; return a; }
    function term() {
      let a = chain();
      for (;;) {
        if (eat("*")) a = { t: "bin", op: "*", a, b: chain() };
        else if (eat("/")) a = { t: "bin", op: "/", a, b: chain() };
        else return a;
      }
    }
    function unary() { if (eat("-")) return { t: "neg", a: unary() }; if (eat("+")) return unary(); return power(); }
    function power() {
      const a = atom();
      if (eat("^")) {
        let e; if (eat("-")) { const n = eat("n"); if (!n) throw new Error("exponent"); e = { t: "neg", a: { t: "num", v: n.v } }; }
        else if (peek() && peek().k === "n") e = { t: "num", v: toks[p++].v };
        else if (eat("(")) { e = expr(); if (!eat(")")) throw new Error("bracket"); }
        else throw new Error("exponent");
        return { t: "pow", a, b: e };
      }
      return a;
    }
    function atom() {
      const t = toks[p++]; if (!t) throw new Error("unexpected end");
      if (t.k === "n") { const nx = peek(); if (nx && nx.k === "n") throw new Error("two numbers"); return { t: "num", v: t.v }; }
      if (t.k === "v") { const nx = peek(); if (nx && nx.k === "n") throw new Error("Use ^ for powers"); return { t: "var", n: t.v }; }
      if (t.k === "(") { const e = expr(); if (!eat(")")) throw new Error("bracket"); return { t: "paren", a: e }; }
      if (t.k === "f") { const a = eat("(") ? (() => { const e = expr(); if (!eat(")")) throw new Error("bracket"); return e; })() : atom(); return { t: "sqrt", a }; }
      throw new Error("unexpected " + t.k);
    }
    const e = expr(); if (p < toks.length) throw new Error("unexpected input"); return e;
  }
  const tryParse = (s) => { try { return parse(s); } catch (e) { return null; } };

  /* ---------- polynomials: Map("x2y1" -> coefficient) ---------- */
  const key = (m) => Object.keys(m).filter((v) => m[v] !== 0).sort().map((v) => v + m[v]).join("");
  const unkey = (k) => { const m = {}; (k.match(/[a-zA-Zπ]-?\d+/g) || []).forEach((t) => { m[t[0]] = +t.slice(1); }); return m; };
  const padd = (a, b, s) => { const r = new Map(a); b.forEach((c, k) => { const v = (r.get(k) || 0) + (s || 1) * c; if (Math.abs(v) < 1e-12) r.delete(k); else r.set(k, v); }); return r; };
  const pmul = (a, b) => { const r = new Map(); a.forEach((ca, ka) => b.forEach((cb, kb) => { const m = unkey(ka), n = unkey(kb); for (const v in n) m[v] = (m[v] || 0) + n[v]; const k = key(m), v = (r.get(k) || 0) + ca * cb; if (Math.abs(v) < 1e-12) r.delete(k); else r.set(k, v); })); return r; };
  const pconst = (c) => (c === 0 ? new Map() : new Map([["", c]]));
  function pinv(d) { const [k, c] = Array.from(d)[0]; if (c === 0) throw new Error("divide by zero"); const m = unkey(k), r = {}; for (const v in m) r[v] = -m[v]; return new Map([[key(r), 1 / c]]); }
  function toPoly(n) {
    switch (n.t) {
      case "num": return pconst(n.v);
      case "var": return new Map([[n.n + "1", 1]]);
      case "paren": return toPoly(n.a);
      case "neg": return padd(new Map(), toPoly(n.a), -1);
      case "bin": {
        if (n.op === "+") return padd(toPoly(n.a), toPoly(n.b));
        if (n.op === "-") return padd(toPoly(n.a), toPoly(n.b), -1);
        if (n.op === "*") return pmul(toPoly(n.a), toPoly(n.b));
        const d = toPoly(n.b); if (d.size === 1) return pmul(toPoly(n.a), pinv(d));
        throw new Error("not polynomial");
      }
      case "pow": {
        const e = evalNode(n.b, {}); if (!Number.isInteger(e) || Math.abs(e) > 60) throw new Error("not polynomial");
        let b = toPoly(n.a); if (b.size > 1 && Math.abs(e) > 12) throw new Error("not polynomial"); if (e < 0) { if (b.size !== 1) throw new Error("not polynomial"); b = pinv(b); }
        let r = pconst(1); for (let i = 0; i < Math.abs(e); i++) r = pmul(r, b); return r;
      }
      default: throw new Error("not polynomial");
    }
  }
  const poly = (src) => { const n = typeof src === "string" ? parse(src) : src; return toPoly(n); };
  const tryPoly = (src) => { try { return poly(src); } catch (e) { return null; } };
  const peq = (a, b) => { const d = padd(a, b, -1); return d.size === 0; };
  const degreeOf = (p, v) => { let d = 0; p.forEach((c, k) => { const m = unkey(k); d = Math.max(d, m[v] || 0); }); return d; };
  const totalDeg = (k) => Object.values(unkey(k)).reduce((a, b) => a + b, 0);
  function polyStr(p) {
    if (p.size === 0) return "0";
    const keys = Array.from(p.keys()).sort((a, b) => { const ma = unkey(a), mb = unkey(b), vars = Array.from(new Set(Object.keys(ma).concat(Object.keys(mb)))).sort(); for (const v of vars) { const d = (mb[v] || 0) - (ma[v] || 0); if (d) return d; } return 0; });
    let out = "";
    keys.forEach((k, i) => {
      const c = p.get(k), m = unkey(k), mono = Object.keys(m).sort().map((v) => v + (m[v] > 1 ? sup(m[v]) : "")).join("");
      const a = Math.abs(c), cs = mono && Math.abs(a - 1) < 1e-12 ? "" : fmt(a).replace(MINUS, "");
      const body = (mono === "" ? fmt(a) : cs + mono);
      out += i === 0 ? (c < 0 ? MINUS : "") + body : (c < 0 ? " " + MINUS + " " : " + ") + body;
    });
    return out;
  }

  /* ---------- numeric evaluation and equivalence ---------- */
  function evalNode(n, env) {
    switch (n.t) {
      case "num": return n.v;
      case "var": { if (n.n === "π" && !("π" in env)) return Math.PI; if (!(n.n in env)) throw new Error("unknown " + n.n); return env[n.n]; }
      case "paren": return evalNode(n.a, env);
      case "neg": return -evalNode(n.a, env);
      case "sqrt": return Math.sqrt(evalNode(n.a, env));
      case "pow": return Math.pow(evalNode(n.a, env), evalNode(n.b, env));
      case "bin": { const a = evalNode(n.a, env), b = evalNode(n.b, env); return n.op === "+" ? a + b : n.op === "-" ? a - b : n.op === "*" ? a * b : a / b; }
    }
    throw new Error("bad node");
  }
  const varsOf = (n, s) => { s = s || new Set(); if (n.t === "var") { if (n.n !== "π") s.add(n.n); } else { ["a", "b"].forEach((k) => { if (n[k] && typeof n[k] === "object") varsOf(n[k], s); }); } return s; };
  const SAMPLES = [[2, 3, 5, 7, 11], [1.5, 2.5, 4, 6, 9], [3, 1.25, 7, 2, 5], [0.5, 4, 3, 8, 6], [5, 2, 1.5, 3.5, 4.5]];
  function equiv(a, b, extraVars) {
    const na = typeof a === "string" ? tryParse(a) : a, nb = typeof b === "string" ? tryParse(b) : b; if (!na || !nb) return false;
    const vs = Array.from(new Set([...varsOf(na), ...varsOf(nb), ...(extraVars || [])])).sort(); let good = 0;
    for (const s of SAMPLES) {
      const env = {}; vs.forEach((v, i) => { env[v] = s[i % s.length] + (i >= s.length ? 0.37 : 0); });
      let x, y; try { x = evalNode(na, env); y = evalNode(nb, env); } catch (e) { return false; }
      if (!isFinite(x) || !isFinite(y)) continue;
      if (Math.abs(x - y) > 1e-7 * Math.max(1, Math.abs(x), Math.abs(y))) return false; good++;
    }
    return good > 0;
  }

  /* ---------- checks used by the practice questions ---------- */
  const terms = (n) => { if (n.t === "paren") return terms(n.a); if (n.t === "bin" && (n.op === "+" || n.op === "-")) return terms(n.a).concat(n.op === "-" ? terms(n.b).map((t) => ({ t: "neg", a: t })) : terms(n.b)); return [n]; };
  const hasBrackets = (s) => /[()]/.test(String(s));
  /* "expanded and simplified": same polynomial, no brackets, like terms collected */
  function checkExpanded(str, target) {
    const n = tryParse(str); if (!n) return { ok: false, why: "parse" };
    const p = tryPoly(n); if (!p) return { ok: false, why: "parse" };
    if (!peq(p, target)) return { ok: false, why: "wrong" };
    if (hasBrackets(str)) return { ok: false, why: "brackets" };
    if (terms(n).length !== target.size) return { ok: false, why: "collect" };
    return { ok: true };
  }
  function factorsOf(n) {
    if (n.t === "paren") return factorsOf(n.a);
    if (n.t === "neg") return [{ t: "num", v: -1 }].concat(factorsOf(n.a));
    if (n.t === "bin" && n.op === "*") return factorsOf(n.a).concat(factorsOf(n.b));
    return [n];
  }
  function primitive(p) {
    const cs = Array.from(p.values()); if (cs.some((c) => !Number.isInteger(Math.round(c * 1e9) / 1e9))) return true;
    const g = cs.map((c) => Math.round(Math.abs(c))).reduce((a, b) => gcd(a, b), 0);
    if (g > 1) return false;
    const ms = Array.from(p.keys()).map(unkey); const vs = new Set(); ms.forEach((m) => Object.keys(m).forEach((v) => vs.add(v)));
    for (const v of vs) if (ms.every((m) => (m[v] || 0) >= 1)) return false;
    return true;
  }
  /* wantBrackets: how many non-monomial factors the answer must contain (powers like (x+2)^2 count as 2) */
  function checkFactorised(str, target, wantBrackets) {
    const n = tryParse(str); if (!n) return { ok: false, why: "parse" };
    const p = tryPoly(n); if (!p) return { ok: false, why: "parse" };
    if (!peq(p, target)) return { ok: false, why: "wrong" };
    if (n.t === "bin" && (n.op === "+" || n.op === "-")) return { ok: false, why: "notfactorised" };
    let count = 0, allPrim = true;
    factorsOf(n).forEach((f) => {
      let base = f, times = 1;
      if (f.t === "pow") { base = f.a; times = evalNode(f.b, {}); }
      const bp = tryPoly(base); if (!bp) { allPrim = false; return; }
      if (bp.size > 1) { count += times; if (!primitive(bp)) allPrim = false; }
    });
    if (count === 0) return { ok: false, why: "notfactorised" };
    if (!allPrim) return { ok: false, why: "notfully" };
    if (count < (wantBrackets || 1)) return { ok: false, why: "notfully" };
    return { ok: true };
  }
  /* is `ans` (with or without "x =") a correct rearrangement of eq `lhs = rhs` for subject v? */
  function checkSubject(lhs, rhs, v, ans) {
    let a = String(ans).trim(); const m = new RegExp("^" + v + "\\s*=\\s*").exec(a); if (m) a = a.slice(m[0].length);
    if (!a || a.includes("=")) return false;
    const na = tryParse(a), nl = tryParse(lhs), nr = tryParse(rhs); if (!na || !nl || !nr) return false;
    if (varsOf(na).has(v)) return false;
    const vs = Array.from(new Set([...varsOf(nl), ...varsOf(nr)])).sort(); let good = 0;
    for (const s of SAMPLES) {
      const env = {}; vs.forEach((u, i) => { env[u] = s[i % s.length] + 0.13 * i; });
      try { env[v] = evalNode(na, env); const d = evalNode(nl, env) - evalNode(nr, env); if (!isFinite(d)) continue; if (Math.abs(d) > 1e-6 * Math.max(1, Math.abs(evalNode(nl, env)))) return false; good++; } catch (e) { return false; }
    }
    return good > 0;
  }

  /* ---------- linear equations with steps ---------- */
  const lin = (p, v) => ({ a: p.get(v + "1") || 0, b: p.get("") || 0 });
  const sgn = (c, v) => (c < 0 ? MINUS + " " : "") + (Math.abs(c) === 1 && v ? "" : fmt(Math.abs(c))) + (v || "");
  function frac(n, d) { if (d < 0) { n = -n; d = -d; } const g = gcd(Math.round(n), Math.round(d)) || 1; return Number.isInteger(n) && Number.isInteger(d) && g > 1 ? [n / g, d / g] : [n, d]; }
  function solveLinear(src, v) {
    const parts = String(src).split("="); if (parts.length !== 2) return { error: "Write an equation with one = sign, like 3x + 5 = 20." };
    let L, R; try { L = poly(parts[0]); R = poly(parts[1]); } catch (e) { return { error: "I couldn't read that. Use numbers, one letter, + − × ÷ and brackets." }; }
    if (!v) { const s = new Set(); [L, R].forEach((p) => p.forEach((c, k) => Object.keys(unkey(k)).forEach((u) => s.add(u)))); if (s.size !== 1) return { error: "Use exactly one letter, like x." }; v = Array.from(s)[0]; }
    if (degreeOf(L, v) > 1 || degreeOf(R, v) > 1) return { error: "Only equations without powers (linear equations) work here." };
    const steps = []; let { a: a1, b: b1 } = lin(L, v), { a: a2, b: b2 } = lin(R, v);
    const side = (a, b) => {
      const inv = a && !Number.isInteger(a) ? Math.round(1 / Math.abs(a) * 1e9) / 1e9 : 0;
      if (inv && Number.isInteger(inv)) { const t = (a < 0 ? MINUS : "") + v + "/" + inv; return b ? t + (b < 0 ? " " + MINUS + " " : " + ") + fmt(Math.abs(b)) : t; }
      return polyStr(new Map([...(a ? [[v + "1", a]] : []), ...(b ? [["", b]] : [])]));
    };
    steps.push({ note: "Start", eq: String(src).replace(/-/g, MINUS).replace(/\s+/g, " ").trim() });
    if (hasBrackets(src)) steps.push({ note: "Expand the brackets and collect like terms", eq: side(a1, b1) + " = " + side(a2, b2) });
    if (a1 === a2) return a1 === 0 || b1 !== b2 ? { error: b1 === b2 ? "This is true for every x." : "No value of " + v + " makes this true." } : { error: "This is true for every " + v + "." };
    if (a2 !== 0 && a2 !== a1) {
      const keepLeft = a1 > a2, m = keepLeft ? a2 : a1;
      steps.push({ note: (m > 0 ? "Subtract " : "Add ") + sgn(Math.abs(m), v) + " " + "from both sides", eq: "" });
      if (keepLeft) { a1 -= a2; a2 = 0; } else { a2 -= a1; a1 = 0; }
      steps[steps.length - 1].eq = side(a1, b1) + " = " + side(a2, b2);
      if (a1 === 0) { const t = [a1, a2, b1, b2]; a1 = a2; a2 = 0; const tb = b1; b1 = b2; b2 = tb; steps.push({ note: "Swap the sides so the " + v + " term is on the left", eq: side(a1, b1) + " = " + side(a2, b2) }); }
    }
    if (b1 !== 0) { steps.push({ note: (b1 > 0 ? "Subtract " : "Add ") + fmt(Math.abs(b1)) + " " + "from both sides", eq: "" }); b2 -= b1; b1 = 0; steps[steps.length - 1].eq = side(a1, 0) + " = " + fmt(b2); }
    if (a1 !== 1) { const iv = Math.round(1 / a1 * 1e9) / 1e9; steps.push({ note: Math.abs(a1) < 1 && Number.isInteger(iv) ? "Multiply both sides by " + fmt(iv) : "Divide both sides by " + fmt(a1), eq: "" }); }
    const f = frac(b2, a1), val = b2 / a1, mulCase = Math.abs(a1) < 1 && Number.isInteger(Math.round(1 / a1 * 1e9) / 1e9);
    const vs = mulCase || f[1] === 1 || !Number.isInteger(f[0]) ? fmt(val) : fmt(f[0]) + "/" + f[1];
    if (a1 !== 1) steps[steps.length - 1].eq = v + " = " + vs;
    return { ok: true, v, value: val, steps, answer: v + " = " + vs };
  }
  /* ---------- simultaneous equations ---------- */
  function coeffs(src) {
    const parts = String(src).split("="); if (parts.length !== 2) return null;
    let L, R; try { L = poly(parts[0]); R = poly(parts[1]); } catch (e) { return null; }
    const D = padd(L, R, -1), x = D.get("x1") || 0, y = D.get("y1") || 0, c = -(D.get("") || 0);
    for (const k of D.keys()) if (k !== "x1" && k !== "y1" && k !== "") return null;
    return { x, y, c };
  }
  const eqStr = (a, b, c) => polyStr(new Map([...(a ? [["x1", a]] : []), ...(b ? [["y1", b]] : [])])) + " = " + fmt(c);
  function solvePair(s1, s2) {
    const e1 = coeffs(s1), e2 = coeffs(s2); if (!e1 || !e2) return { error: "Write each equation with x and y, like 2x + y = 7." };
    const det = e1.x * e2.y - e1.y * e2.x; if (Math.abs(det) < 1e-12) return { error: "These lines are parallel or the same, so there is no single solution." };
    const x = (e1.c * e2.y - e1.y * e2.c) / det, y = (e1.x * e2.c - e1.c * e2.x) / det;
    const steps = [{ note: "Equation 1", eq: eqStr(e1.x, e1.y, e1.c) }, { note: "Equation 2", eq: eqStr(e2.x, e2.y, e2.c) }];
    let a = e1, b = e2, elim = "x";
    if (Math.abs(a.x) === Math.abs(b.x)) elim = "y"; else if (Math.abs(a.y) === Math.abs(b.y)) elim = "x"; else elim = Math.abs(a.y * b.y) <= Math.abs(a.x * b.x) ? "y" : "x";
    const co = (e) => (elim === "x" ? e.x : e.y);
    const ca = Math.abs(co(a)), cb = Math.abs(co(b)), L = ca * cb / gcd(ca, cb);
    const ma = L / ca, mb = L / cb;
    let A = a, B = b;
    if (ma !== 1) { A = { x: a.x * ma, y: a.y * ma, c: a.c * ma }; steps.push({ note: "Multiply equation 1 by " + ma, eq: eqStr(A.x, A.y, A.c) }); }
    if (mb !== 1) { B = { x: b.x * mb, y: b.y * mb, c: b.c * mb }; steps.push({ note: "Multiply equation 2 by " + mb, eq: eqStr(B.x, B.y, B.c) }); }
    const same = co(A) * co(B) > 0, S = same ? { x: A.x - B.x, y: A.y - B.y, c: A.c - B.c } : { x: A.x + B.x, y: A.y + B.y, c: A.c + B.c };
    steps.push({ note: (same ? "Subtract" : "Add") + " the equations to remove " + elim, eq: eqStr(S.x, S.y, S.c) });
    const other = elim === "x" ? "y" : "x", val = elim === "x" ? y : x;
    steps.push({ note: "Solve for " + other, eq: other + " = " + fmt(val) });
    steps.push({ note: "Put " + other + " = " + fmt(val) + " into equation 1 and solve for " + elim, eq: elim + " = " + fmt(elim === "x" ? x : y) });
    return { ok: true, x, y, steps };
  }
  function parsePair(s) {
    const t = String(s).replace(/−/g, "-").replace(/\s+/g, "").toLowerCase(); let mx = /x=(-?[\d./]+)/.exec(t), my = /y=(-?[\d./]+)/.exec(t);
    const num = (z) => { if (/\//.test(z)) { const [p, q] = z.split("/"); return +p / +q; } return parseFloat(z); };
    if (mx && my) return { x: num(mx[1]), y: num(my[1]) };
    const m = /^\(?(-?[\d./]+)[,;](-?[\d./]+)\)?$/.exec(t); if (m) return { x: num(m[1]), y: num(m[2]) };
    return null;
  }
  /* ---------- display helpers and small browser UI helpers ---------- */
  function disp(str) {
    let t = String(str).replace(/\s+/g, "").replace(/\^1(?!\d)/g, "").replace(/\^(-?\d+)/g, (m, n) => sup(n)).replace(/\*/g, "×").replace(/\//g, "/");
    t = t.replace(/(?<=[\w)⁰¹²³⁴⁵⁶⁷⁸⁹])([+\-])/g, " $1 ").replace(/(?<=[\w)⁰¹²³⁴⁵⁶⁷⁸⁹])×(?=[\w(])/g, " × ").replace(/=/g, " = ");
    return t.replace(/-/g, MINUS).replace(/ {2,}/g, " ");
  }
  const ui = typeof document === "undefined" ? null : {
    $: (id) => document.getElementById(id),
    say(el, lines) { el.textContent = ""; lines.forEach((l) => { const d = document.createElement("div"); d.textContent = l; el.appendChild(d); }); },
    chips(host, items, fn) { items.forEach((it) => { const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = it.label || it; b.addEventListener("click", () => fn(it)); host.appendChild(b); }); }
  };
  return { normalise, disp, ui, sup, fmt, parse, tryParse, poly, tryPoly, peq, polyStr, padd, pmul, pconst, evalNode, equiv, varsOf, terms, checkExpanded, checkFactorised, checkSubject, factorsOf, primitive, solveLinear, solvePair, coeffs, parsePair, gcd, MINUS, hasBrackets };
});
