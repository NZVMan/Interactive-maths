# Interactive Maths

An interactive learning resource for Year 10 Mathematics (King's College 10MAY scheme of work, Cambridge IGCSE Core).
Each lesson has short explanations, things to play with, and practice questions that mark themselves.

It is a plain static website (HTML, CSS and JavaScript). There is no build step and no dependencies.

## Contents

| Topic | Status |
|---|---|
| 1. Number | Lessons 1–3 done (types of numbers, indices and standard form, fractions/decimals/percentages) |
| 2–11 | Not started |

## Viewing it

Open `index.html` in a browser, or turn on GitHub Pages (Settings → Pages → deploy from the main branch, root folder) to get a link students can use.

## Layout

- `index.html`: home page listing the topics
- `number/`: Topic 1 pages and one script per lesson
- `assets/style.css`: shared styles (light and dark mode)
- `assets/maths.js`: shared maths helpers and the practice-question engine
- `tests/`: `node tests/maths.test.js` checks the maths helpers; `node tests/browser.test.js` loads every page in headless Chrome (needs Playwright)

## Adding a practice question type

In a lesson script, register a generator and put `<div data-practice="name"></div>` in the page:

```js
M.registerPractice("name", () => ({
  q: "Question text (HTML allowed)",
  check: (answer) => answer.trim() === "42",
  explain: "Shown after a correct answer.",
  hint: "Shown after a wrong answer."
}));
```
