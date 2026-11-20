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

assert.strictEqual(M.iroot(16, 4), 2);
assert.strictEqual(M.iroot(125, 3), 5);
assert.strictEqual(M.iroot(144, 2), 12);
assert.strictEqual(M.iroot(15, 2), null);
assert.strictEqual(M.iroot(0, 3), 0);
assert.strictEqual(M.iroot(1000, 3), 10);
assert.strictEqual(M.minus(-3), "−3");
assert.strictEqual(M.paren(-3), "(−3)");
assert.strictEqual(M.paren(4), "4");
assert.strictEqual(M.parseNumber("+45"), 45);
assert.strictEqual(M.parseNumber("−12"), -12);

// ---- fractions
assert.deepStrictEqual(M.fracAdd([1, 2], [1, 3]), [5, 6]);
assert.deepStrictEqual(M.fracSub([1, 4], [3, 4]), [-1, 2]);
assert.deepStrictEqual(M.fracMul([2, 3], [3, 4]), [1, 2]);
assert.deepStrictEqual(M.fracDiv([1, 2], [3, 4]), [2, 3]);
assert.strictEqual(M.mixedStr([7, 2]), "3 1/2");
assert.strictEqual(M.mixedStr([-7, 2]), "−3 1/2");
assert.strictEqual(M.mixedStr([3, 4]), "3/4");
assert.strictEqual(M.mixedStr([4, 1]), "4");
assert.deepStrictEqual(M.parseFracInput("2 1/3"), [7, 3]);
assert.deepStrictEqual(M.parseFracInput("−1/2"), [-1, 2]);
assert.deepStrictEqual(M.parseFracInput("-2 1/2"), [-5, 2]);
assert.deepStrictEqual(M.parseFracInput("6/8"), [3, 4]);
assert.deepStrictEqual(M.parseFracInput("5"), [5, 1]);
assert.strictEqual(M.parseFracInput("1/0"), null);
assert.strictEqual(M.parseFracInput("abc"), null);
assert.deepStrictEqual(M.parseFracAnswer("6/8"), { n: 3, d: 4, simplest: false });
assert.deepStrictEqual(M.parseFracAnswer("3/4"), { n: 3, d: 4, simplest: true });
assert.deepStrictEqual(M.parseFracAnswer("1 1/2"), { n: 3, d: 2, simplest: true });
assert.strictEqual(M.parseFracAnswer("1 3/2").simplest, false);
assert.strictEqual(M.parseFracAnswer("2 2/4").simplest, false);

// ---- rounding
assert.strictEqual(M.roundDP(1.005, 2), 1.01);
assert.strictEqual(M.roundDP(2.35, 1), 2.4);
assert.strictEqual(M.roundDP(-2.35, 1), -2.4);
assert.strictEqual(M.roundDP(3.14159, 3), 3.142);
assert.strictEqual(M.roundDP(0.0004, 2), 0);
assert.strictEqual(M.roundSF(0.004567, 2), 0.0046);
assert.strictEqual(M.roundSF(45678, 2), 46000);
assert.strictEqual(M.roundSF(1000, 1), 1000);
assert.strictEqual(M.roundSF(999.7, 2), 1000);
assert.strictEqual(M.roundSF(3.14159, 3), 3.14);
assert.strictEqual(M.toFixedDP(3.4, 2), "3.40");
assert.strictEqual(M.toSF(3.04, 2), "3.0");
assert.strictEqual(M.toSF(0.0304, 2), "0.030");
assert.strictEqual(M.toSF(45678, 2), "46000");
assert.strictEqual(M.toSF(999.7, 2), "1000");

// ---- expression steps
const ev = (s) => M.evalSteps(s);
assert.strictEqual(ev("3 + 4 × 2").result, 11);
assert.strictEqual(ev("(3+4)×2").result, 14);
assert.strictEqual(ev("-3^2").result, -9);
assert.strictEqual(ev("(-3)^2").result, 9);
assert.strictEqual(ev("-3 + 5").result, 2);
assert.strictEqual(ev("2^3^2").result, 512);
assert.strictEqual(ev("8 ÷ 2 × 4").result, 16);
assert.strictEqual(ev("12 − 3 − 2").result, 7);
assert.strictEqual(ev("2(3+4)").result, 14);
assert.strictEqual(ev("(1+2)(3+4)").result, 21);
assert.strictEqual(ev("-(2+3)").result, -5);
assert.strictEqual(ev("0.1 + 0.2").result, 0.3);
assert.strictEqual(ev("3²+4²").result, 25);
assert.strictEqual(ev("2 - -3").result, 5);
assert.strictEqual(ev("5 × (−2)").result, -10);
assert.strictEqual(ev("((2+3)×(4−1))^2").result, 225);
assert.ok(ev("1/0").error && ev("3 +").error && ev("(3+4").error && ev("3+4)").error && ev("abc").error && ev("").error);
assert.deepStrictEqual(ev("3 + 4 × 2").steps.map((x) => x.expr), ["3 + 8", "11"]);
assert.strictEqual(ev("(3 + 4) × 2").steps[0].expr, "7 × 2");
assert.strictEqual(ev("(3 + 4) × 2").steps[0].note, "Brackets first. Add: 3 + 4 = 7");

// ---- time
assert.strictEqual(M.parseTime("3:25"), 205);
assert.strictEqual(M.parseTime("15:25"), 925);
assert.strictEqual(M.parseTime("3.25pm"), 925);
assert.strictEqual(M.parseTime("7:45 am"), 465);
assert.strictEqual(M.parseTime("12:00 am"), 0);
assert.strictEqual(M.parseTime("12:30pm"), 750);
assert.strictEqual(M.parseTime("0745"), 465);
assert.strictEqual(M.parseTime("noon"), 720);
assert.strictEqual(M.parseTime("25:00"), null);
assert.strictEqual(M.parseTime("7:75"), null);
assert.strictEqual(M.parseTime("13:00pm"), null);
assert.strictEqual(M.fmt24(925), "15:25");
assert.strictEqual(M.fmt24(5), "00:05");
assert.strictEqual(M.fmt12(925), "3:25 pm");
assert.strictEqual(M.fmt12(0), "12:00 am");
assert.strictEqual(M.fmt12(720), "12:00 pm");
assert.strictEqual(M.durationStr(150), "2 h 30 min");
assert.strictEqual(M.durationStr(45), "45 min");
assert.strictEqual(M.durationStr(120), "2 h");
assert.ok(M.clockSVG(3, 25).indexOf("<svg") === 0 && M.dialSVG(40, 120, 20, 10, "km/h").indexOf("<svg") === 0);

console.log("all maths tests passed");
