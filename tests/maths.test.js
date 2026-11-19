const assert = require("assert");
const M = require("../assets/maths.js");

assert.deepStrictEqual(M.primeFactors(180), [2, 2, 3, 3, 5]);
assert.strictEqual(M.factorString(180), "2² × 3² × 5");
assert.strictEqual(M.gcd(12, 18), 6);
assert.strictEqual(M.lcm(12, 18), 36);
assert.ok(M.isPrime(2) && M.isPrime(97) && !M.isPrime(1) && !M.isPrime(91));
assert.ok(M.isSquare(49) && !M.isSquare(50) && M.isCube(64) && M.isCube(1) && !M.isCube(63));

assert.deepStrictEqual(M.simplify(6, 8), [3, 4]);
assert.strictEqual(M.toDecimal(3, 8).text, "0.375");
assert.strictEqual(M.toDecimal(1, 3).text, "0.(3)");
assert.strictEqual(M.toDecimal(1, 6).text, "0.1(6)");
assert.strictEqual(M.toDecimal(1, 7).text, "0.(142857)");
assert.strictEqual(M.toDecimal(7, 4).text, "1.75");
assert.deepStrictEqual(M.decimalToFraction("0.375"), [3, 8]);
assert.deepStrictEqual(M.decimalToFraction("12.5"), [25, 2]);

assert.deepStrictEqual(M.toStandardForm(45000), { a: "4.5", n: 4 });
assert.deepStrictEqual(M.toStandardForm(0.00032), { a: "3.2", n: -4 });
assert.deepStrictEqual(M.toStandardForm(7.5 * 4), { a: "3", n: 1 });
assert.strictEqual(M.toStandardForm(2.4 * 3).a, "7.2");
assert.strictEqual(M.shiftDecimal("3.07", 5), "307000");
assert.strictEqual(M.shiftDecimal("8.25", -3), "0.00825");

let c = M.classify("√2");
assert.ok(c.sets.irrational && !c.sets.rational && c.sets.real);
c = M.classify("√49");
assert.ok(c.sets.rational && c.sets.integer && c.sets.natural && c.sets.prime && !c.sets.square);
c = M.classify("3/4");
assert.ok(c.sets.rational && !c.sets.integer);
c = M.classify("-3");
assert.ok(c.sets.integer && !c.sets.natural && c.sets.rational);
c = M.classify("−3");
assert.ok(c.sets.integer && !c.sets.natural);
c = M.classify("0");
assert.ok(c.sets.integer && !c.sets.natural);
c = M.classify("91");
assert.ok(!c.sets.prime);
c = M.classify("π");
assert.ok(c.sets.irrational);
c = M.classify("8");
assert.ok(c.sets.cube && !c.sets.square);
assert.ok(M.classify("abc").error);
assert.ok(M.classify("1/0").error);

assert.ok(M.sameCounts(M.parseFactorProduct("2^2 x 3^2 x 5"), M.factorCounts(180)));
assert.ok(M.sameCounts(M.parseFactorProduct("2×2×3×3×5"), M.factorCounts(180)));
assert.ok(M.sameCounts(M.parseFactorProduct("2² × 3² × 5"), M.factorCounts(180)));
assert.strictEqual(M.parseFactorProduct("hello"), null);
assert.deepStrictEqual(M.parseStandardForm("3.2 x 10^4"), { a: 3.2, n: 4 });
assert.deepStrictEqual(M.parseStandardForm("3.2×10^-3"), { a: 3.2, n: -3 });
assert.deepStrictEqual(M.parseStandardForm("1.5 x 10^10"), { a: 1.5, n: 10 });
assert.strictEqual(M.parseNumber("3/8"), 0.375);
assert.strictEqual(M.parseNumber("37.5%"), 37.5);
assert.ok(Number.isNaN(M.parseNumber("abc")));

console.log("all maths tests passed");
