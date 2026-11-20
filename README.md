# Interactive Maths

An interactive learning resource for Year 10 Mathematics, following the King's College 10MAY scheme of work for 2027 (Cambridge IGCSE Core). Each lesson has short explanations, things to play with, and practice questions that mark themselves.

It is a plain static website (HTML, CSS and JavaScript) with no build step and no dependencies for the lessons.

**Live site:** https://nzvman.github.io/interactive-maths/ (once GitHub Pages is switched on; see `PLAN.md`)

## Where things are up to

| Topic | Status |
|---|---|
| 1. Number | Lessons 1–3 built; lessons 4–11 planned |
| 2–11 | Outline pages generated from the handbook; interactive lessons not started |

Full status, the next steps and the lesson checklist are in **[PLAN.md](PLAN.md)**.

## Picking this up from any Claude client

1. Open this repository in Claude (Claude Code, or a claude.ai chat with the GitHub repository attached).
2. Say: *"Read CLAUDE.md and PLAN.md, then build the next unchecked lesson."*
3. Claude works on a branch, runs the tests, updates `PLAN.md`, and pushes. Merge to `main` when you are happy.

Details for each client are in **[CLAUDE.md](CLAUDE.md)**.

## What is in the repository

- `index.html`, `number/`: the website (Topic 1 lessons are hand-written)
- `course/scheme-of-work.json`: the handbook as structured data (topics, objectives, lesson counts, textbook pages, timeline, common tests, command words)
- `course/handbook.md` and `course/index.html`: readable copies of that data, plus the "Course information" page for students
- `<topic>/index.html` for Topics 2–11: outline pages of what each topic covers
- `assets/style.css`, `assets/maths.js`: shared styles, maths helpers and the practice-question engine
- `tools/build-site.js`: regenerates the home page, course page, handbook copy and outline pages from the JSON
- `tests/`: `node tests/maths.test.js` (logic) and `node tests/browser.test.js` (loads every page in headless Chrome and checks every practice question type), `node tests/ux.test.js` (practice sets, symbol buttons, saved progress, no sideways scrolling on a phone)

## Working on it

View locally by opening `index.html` in a browser. After changing `course/scheme-of-work.json`, run `node tools/build-site.js`.

### Adding a practice question type

In a lesson script, register a generator and put `<div data-practice="name"></div>` in the page:

```js
M.registerPractice("name", () => ({
  q: "Question text (HTML allowed)",
  check: (answer) => answer.trim() === "42",
  explain: "Shown after a correct answer.",
  hint: "Shown after a wrong answer.",
  placeholder: "e.g. 42",        // answer format shown in the box
  keys: ["×", "^"],              // optional symbol buttons for phones
  choices: ["yes", "no"]         // optional: tap buttons instead of typing
}));
```

Each practice box is a set of 5 questions; finishing a set saves progress in the student's browser.

## Source

Course content is taken from the *10MAY Mathematics Course Handbook 2027* (King's College, revised November 2026). Textbook page numbers refer to Cambridge IGCSE Core Mathematics 4th edition (Pimentel & Wall).
