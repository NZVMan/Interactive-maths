# Plan and status

This file is the single place to see where the project is and what to do next. Update the tables and checkboxes whenever you finish something.

## Goal

An interactive Year 10 Mathematics resource for King's College 10MAY (2027), following the school's scheme of work (Cambridge IGCSE Core, NZ Curriculum levels 5–6). Each lesson has a short explanation, applets students can play with, a worked example and self-marking practice questions. Students open it on any device from a link; no sign-in.

The source of truth for what to teach is `course/scheme-of-work.json` (readable copy: `course/handbook.md`). Topic order and lesson counts come from there.

## Deadlines that matter

Term 1 starts 27 Jan 2027. The class needs Number from week 1 (25 Jan), Common Test 1 on Number in week 6 (1–7 Mar), and Algebra from week 7 (8 Mar). So the realistic order of work is: finish Topic 1, then Topic 2, then Topics 3 and 4 before camp, and the rest through the year in timeline order.

## Status

| Topic | Lessons in scheme | Interactive lessons built | State |
|---|---|---|---|
| 1. Number | 13 | 3 of 11 planned pages | in progress |
| 2. Algebra | 13 | 0 | outline page only |
| 3. Coordinate Geometry | 4 | 0 | outline page only |
| 4. Graphs | 7 | 0 | outline page only |
| 5. Geometry | 7 | 0 | outline page only |
| 6. Mensuration | 7 | 0 | outline page only |
| 7. Trigonometry | 7 | 0 | outline page only |
| 8. Probability | 3 | 0 | outline page only |
| 9. Statistics | 5 | 0 | outline page only |
| 10. Vectors | 2 | 0 | outline page only |
| 11. Transformations | 2 | 0 | outline page only |

Site hosting:
- [x] Code merged into `main`
- [ ] GitHub Pages switched on (Settings → Pages → Deploy from a branch → `main` / root). Expected address: https://nzvman.github.io/interactive-maths/
- [ ] Teacher has tried it on a phone and a school laptop

## Topic 1: Number (next up)

Done:
- [x] Lesson 1: types of numbers, primes, prime factors, HCF and LCM (1.1)
- [x] Lesson 2: indices and standard form (1.7; roots only via fractional indices)
- [x] Lesson 3: fractions, decimals, percentages, ordering, percentage change (1.5, 1.6, 1.12)

To build (file names follow `number/lesson-N-short-name.html` plus `number/lessonN.js`):
- [ ] Lesson 4: directed numbers, squares and roots (1.3, 1.4). Number-line applet for adding and subtracting negatives; temperature and flood-level contexts; calculate with squares, cubes and roots, e.g. 3² × ∛16. *Gap: 1.3 and 1.4 are in the handbook but not yet covered anywhere.*
- [ ] Lesson 5: four rules, fractions and order of operations (1.8). Fraction arithmetic with mixed numbers, a BIDMAS step-through, brackets.
- [ ] Lesson 6: estimating, rounding and bounds (1.9, 1.10). Rounding to decimal places and significant figures, upper and lower bounds on a number line.
- [ ] Lesson 7: ratio, proportion and rates (1.11). Share in a ratio (bar model), direct and inverse proportion, average speed, scale drawings.
- [ ] Lesson 8: calculator use and time (1.13, 1.14). Checking answers, 12/24-hour clock, timetables.
- [ ] Lesson 9: money and personal finance (1.15, 1.16). Currency conversion, discount, profit and loss, simple and compound interest (compound interest formula is required).
- [ ] Lesson 10: sets and Venn diagrams (1.2). Notation n(A), ℰ, A ∪ B, A ∩ B; a drag-the-items Venn applet.
- [ ] Lesson 11: revision and practice test for Common Test 1.
- [ ] Update `number/index.html` (it already lists these as "coming soon") and flip each to a link as it is built.

## Topics 2–11: suggested lesson breakdown

Lesson counts come from the handbook. Titles and applet ideas are suggestions, not requirements. Build in timeline order.

**2. Algebra (13 lessons).** 2.1–2.2 (5): substituting into formulae, forming expressions, rearranging formulae, expanding brackets, common factors, double brackets, factorising ax² + bx + c (algebra-tile applet). 2.4 (3): index laws with algebra. 2.5 (5): one-unknown equations (balance applet), forming equations, simultaneous equations (graph view plus elimination steps).

**3. Coordinate Geometry (4).** Plotting points, gradient (drag two points), y = mx + c (sliders), parallel lines.

**4. Graphs (7).** Sequences and nth term (2), practical graphs: travel and conversion graphs (2), function graphs: linear, quadratic and reciprocal, plus solving equations by graph (3).

**5. Geometry (7).** Vocabulary and constructions, similarity and congruence, symmetry (3 together); angle properties and reasons with correct terminology (4).

**6. Mensuration (7).** Unit conversion including area and volume, perimeter and area, circles, arcs and sectors, surface area and volume, compound shapes. Answers in terms of π where asked.

**7. Trigonometry (7).** Three-figure bearings, Pythagoras, sine, cosine and tangent for sides and angles (answers to 1 decimal place).

**8. Probability (3).** Single events and the 0–1 scale, relative frequency and expected frequency, combined events with possibility diagrams, tree diagrams and two-set Venn diagrams.

**9. Statistics (5).** Collecting and tabulating data, diagrams, mean/median/mode/range, scatter diagrams, correlation and lines of best fit by eye.

**10. Vectors (2).** Column vectors, translations, adding and subtracting, scalar multiples.

**11. Transformations (2).** Reflection, rotation (multiples of 90°), translation and enlargement (positive and fractional scale factors) on a grid.

## How each lesson is built (definition of done)

1. Objectives box that matches the handbook codes it covers.
2. Short explanation, a key-idea box, at least one "Try it" applet (each with a "Predict first" prompt and reveal) and one worked example.
3. At least two practice question types using the shared engine (see below). Every question has a `hint` and an `explain`, plus a `placeholder` showing the answer format. Add `keys: ["×", "^"]` for symbol buttons, or `choices: ["yes", "no"]` for tap-to-answer questions.
4. Works at 390 px wide with no horizontal scrolling, and in light and dark mode.
5. Uses NZ English and the handbook's wording and notation (e.g. "HCF", "standard form", "three-figure bearings").
6. Added to the topic contents page and linked from the previous and next lesson.
7. `node tests/maths.test.js`, `node tests/browser.test.js` and `node tests/ux.test.js`, `node tests/contrast.test.js` and `node tests/a11y.test.js` all pass (add tests for any new helper in `assets/maths.js`).
8. This file updated.

## UX review (done and still to do)

Done in round 1:
- [x] Home page leads with "Start here" (Topic 1); other topics collapsed under "Coming later"; Course information linked near the top; term/week dates removed from student-facing cards
- [x] Practice is now a set of 5 questions with a result, first-time-right count, "Show me the answer" after two wrong tries, and a "Completed" tag
- [x] Symbol buttons (×, ^, /, −) and an example in the answer box; yes/no and < > = questions use big tap buttons
- [x] "On this page" jump links on each lesson; practice progress saved in the browser (no accounts) and shown on the topic contents page
- [x] Skip-to-content link, larger breadcrumb tap targets, print layout, worked example one step per line

Done in round 2:
- [x] "Predict first" prompt with a reveal on every "Try it" applet (add one to every new applet)
- [x] Colour contrast checked in light and dark mode (`node tests/contrast.test.js`): text 4.5:1 (3:1 large), form-field borders 3:1; placeholder and field-border colours fixed
- [x] Emulated checks (`node tests/a11y.test.js`): no sideways scroll from 320 to 1280 px wide, field labels, tap targets, heading order, visible keyboard focus, a practice set finishable by keyboard

Still to do:
- [ ] Try on a real phone (iPhone Safari and Android Chrome) and with a real screen reader (VoiceOver or NVDA). The automated checks above cannot replace this.
- [ ] Two-column layout for applets on wide screens
- [ ] Decide whether the outline pages for later topics should be hidden from students

## Technical notes

- Plain HTML, CSS and JavaScript. No build step for lessons, no dependencies. Keep it that way so it keeps working on GitHub Pages and school networks.
- `assets/maths.js` holds shared helpers and the practice engine (`M.registerPractice`, `data-practice="name"`). It also runs in Node so the logic can be unit tested. Generators are exposed as `M._generators` for the browser test, which checks that every generated question accepts the answer in its own explanation.
- Pages for Topics 2–11 and the course page are **generated**: edit `course/scheme-of-work.json` and run `node tools/build-site.js`. Do not hand-edit `index.html`, `course/index.html`, `course/handbook.md` or the `<topic>/index.html` outline pages. When a topic gets real lessons, set its `status` to `"live"` in the JSON and hand-write that topic's `index.html` (as `number/` is) so the generator stops overwriting it.
- Maths notation is currently Unicode (superscripts via `M.sup`, `√`, `π`). Algebra, trigonometry and vectors will need fractions and column vectors; decide then whether to add KaTeX (vendored into `assets/`, not from a CDN, so it works offline) or keep Unicode and small inline SVG.
- Dynamic diagrams are built with DOM and SVG calls (not `innerHTML` with user text) so typed input can never inject markup.

## Open decisions

- Whether to embed Desmos or GeoGebra for graphs and geometry, or build small custom canvases. Embeds are quicker but need internet and a third party's terms; custom is more work but fully controlled.
- Whether students should get saved progress (browser `localStorage`, no accounts) or a teacher view. Not started; the resource works without either.
- Whether the repository should stay public. The course page copies the handbook's textbook names and public revision-site links, but not the school's Google Drive links.

## Picking this up in another Claude client

See `CLAUDE.md` for the exact steps. In short: attach this GitHub repository, tell Claude to read `CLAUDE.md` and `PLAN.md`, and say which item to build next.
