const A = require("../assets/algebra.js");
const assert = require("assert");
const S = (s) => A.polyStr(A.poly(s));
const eq = (a, b, m) => assert.strictEqual(a, b, m);

// parsing and expanding
eq(S("3x(2x − 4y)"), "6x² − 12xy");
eq(S("(x + 4)(x − 7)"), "x² − 3x − 28");
eq(S("(2x+3)^2"), "4x² + 12x + 9");
eq(S("3x⁴ × 5x"), "15x⁵");
eq(S("10x³ ÷ 2x²"), "5x");
eq(S("(x⁶)²"), "x¹²");
eq(S("−x^2 + 3"), "−x² + 3");
eq(S("2(x+1) + 3(x−2)"), "5x − 4");
eq(S("x/2 + x/2"), "x");
assert.throws(() => A.poly("x2"));
assert.strictEqual(A.tryParse("2 +"), null);

// expanded check
assert.ok(A.checkExpanded("6x^2 - 12xy", A.poly("3x(2x−4y)")).ok);
eq(A.checkExpanded("3x(2x−4y)", A.poly("3x(2x−4y)")).why, "brackets");
eq(A.checkExpanded("2x + 3x + 1", A.poly("5x+1")).why, "collect");
eq(A.checkExpanded("5x + 2", A.poly("5x+1")).why, "wrong");

// factorised check
const t1 = A.poly("9x² + 15xy");
assert.ok(A.checkFactorised("3x(3x + 5y)", t1, 1).ok);
eq(A.checkFactorised("3(3x² + 5xy)", t1, 1).why, "notfully");
eq(A.checkFactorised("9x² + 15xy", t1, 1).why, "notfactorised");
eq(A.checkFactorised("3x(3x+4y)", t1, 1).why, "wrong");
const t2 = A.poly("x² − 3x − 28");
assert.ok(A.checkFactorised("(x − 7)(x + 4)", t2, 2).ok);
assert.ok(A.checkFactorised("(x+4)(x−7)", t2, 2).ok);
const t3 = A.poly("x² + 6x + 9");
assert.ok(A.checkFactorised("(x+3)^2", t3, 2).ok);
assert.ok(A.checkFactorised("(x+3)(x+3)", t3, 2).ok);
eq(A.checkFactorised("(2x+6)(0.5x+1.5)", t3, 2).ok, false);

// subject of formula
assert.ok(A.checkSubject("y", "mx + c", "x", "(y − c)/m"));
assert.ok(A.checkSubject("y", "mx + c", "x", "x = (y-c)/m"));
assert.ok(!A.checkSubject("y", "mx + c", "x", "y − c/m"));
assert.ok(A.checkSubject("A", "πr²", "r", "√(A/π)"));
assert.ok(A.checkSubject("v", "u + at", "t", "(v−u)/a"));
assert.ok(!A.checkSubject("v", "u + at", "t", "t = v − u/a"));

// equivalence
assert.ok(A.equiv("x^-2", "1/x^2"));
assert.ok(A.equiv("2x⁻²", "2/x²"));
assert.ok(!A.equiv("x^2", "x^3"));
assert.ok(A.equiv("x^0", "1"));

// equations
let r = A.solveLinear("3x + 5 = 20"); assert.ok(r.ok); eq(r.value, 5);
r = A.solveLinear("5x − 4 = 2x + 11"); assert.ok(r.ok); eq(r.value, 5);
r = A.solveLinear("2x + 3 = 5x − 9"); assert.ok(r.ok); eq(r.value, 4);
r = A.solveLinear("3(x + 2) = 21"); assert.ok(r.ok); eq(r.value, 5);
r = A.solveLinear("7 − 2x = 1"); assert.ok(r.ok); eq(r.value, 3);
r = A.solveLinear("x/2 + 1 = 6"); assert.ok(r.ok); eq(r.value, 10);
r = A.solveLinear("4x = 6"); eq(r.answer, "x = 3/2");
r = A.solveLinear("x + 1 = x + 2"); assert.ok(r.error);
assert.ok(A.solveLinear("x^2 = 4").error);

// simultaneous
r = A.solvePair("2x + y = 7", "x − y = 2"); assert.ok(r.ok); eq(r.x, 3); eq(r.y, 1);
r = A.solvePair("3x + 2y = 12", "2x − 3y = −5"); eq(r.x, 2); eq(r.y, 3);
r = A.solvePair("x + y = 5", "2x + 2y = 10"); assert.ok(r.error);
r = A.solvePair("y = 2x + 1", "3x + y = 11"); eq(r.x, 2); eq(r.y, 5);
assert.deepStrictEqual(A.parsePair("x = 3, y = −2"), { x: 3, y: -2 });
assert.deepStrictEqual(A.parsePair("(3, -2)"), { x: 3, y: -2 });
console.log("all algebra tests passed");
