# Instructions for Claude (any client)

You are helping a Year 10 maths teacher at King's College, Auckland build an interactive learning website. Read `PLAN.md` first: it has the current status, what to build next and the definition of done for a lesson.

## Orientation (read in this order)

1. `PLAN.md` – status, next steps, conventions.
2. `course/handbook.md` – the school's 2027 scheme of work for this class, as structured text (generated from `course/scheme-of-work.json`).
3. `number/lesson-1-types-of-numbers.html` and `number/lesson1.js` – the reference example of a finished lesson page and its script.
4. `assets/maths.js` – shared helpers and the practice-question engine.

## Rules

- NZ English. Audience is 14-year-old students; the teacher is the other reader. Keep explanations short and concrete.
- Follow the handbook's objectives, wording and notation. Do not invent syllabus content. If the handbook is unclear, say so and ask.
- Plain HTML, CSS and JavaScript only. No frameworks, no build step for lessons, no network requests at runtime.
- Build dynamic content with DOM or SVG calls and `textContent`, not by putting user-typed text into `innerHTML`.
- Do not hand-edit generated files (`index.html`, `course/index.html`, `course/handbook.md`, and the `<topic>/index.html` pages for topics whose `status` is `"outline"`). Change `course/scheme-of-work.json` and run `node tools/build-site.js`.
- Every "Try it" applet starts with a `.predict` block (a question plus a `<details>` reveal).
- Every practice question needs a `placeholder`; use `keys` for symbols and `choices` for yes/no or comparison questions, because students answer on phones.
- Do not copy the school's Google Drive links or any student data into the repo.

## Workflow

1. Work on a branch named for the task (e.g. `topic-1-lesson-4`), not directly on `main`.
2. Build the lesson following the definition of done in `PLAN.md`.
3. Run `node tests/maths.test.js`, `node tests/browser.test.js` and `node tests/ux.test.js`, `node tests/contrast.test.js` and `node tests/a11y.test.js` (the browser tests needs Playwright and Chrome; if unavailable, say so and at least run `node --check` on each script and open the page).
4. Look at the page at about 390 px wide before calling it done.
5. Update the status tables and checkboxes in `PLAN.md` and the lesson list on the topic page.
6. Commit with a clear message, push the branch, and merge to `main` when the teacher is happy. GitHub Pages serves `main`.

## Starting a session from each client

- **Claude Code (terminal, web or desktop):** open or select the repository `NZVMan/interactive-maths`. `CLAUDE.md` loads automatically. Say, for example: "Build the next lesson in PLAN.md."
- **Claude on the web or phone (claude.ai / app):** start a chat, attach or connect the GitHub repository `NZVMan/interactive-maths`, then say: "Read CLAUDE.md and PLAN.md in the repo, then build the next unchecked lesson." If the session has no GitHub write access, ask Claude to produce the files and commit them yourself, or sign the session in to GitHub.
- **Any other client:** paste the contents of `CLAUDE.md` and `PLAN.md` into the chat along with whichever files are needed.

If a session has no working GitHub sign-in, Claude can still write and test files in its workspace, but cannot create repositories or change GitHub settings (such as turning on Pages). Those are done by the teacher in the GitHub website.
