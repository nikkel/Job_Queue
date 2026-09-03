# .claude_work

This folder is a knowledge base for future Claude Code sessions on the `Job_Queue` repo. It exists so a session can get oriented without re-reading every file from scratch. It's checked into git and should be kept up to date as the project changes — if you make a structural change, update the relevant file here in the same session.

## Contents

- [`architecture.md`](./architecture.md) — system overview: how the frontend, API, worker, Redis, and MySQL fit together.
- [`backend.md`](./backend.md) — Flask app structure, routes, models, util modules, and known quirks.
- [`frontend.md`](./frontend.md) — component tree, API client structure, state/context flow.
- [`testing.md`](./testing.md) — how both test suites are structured, how to run them, how CI and Dependabot auto-merge are wired.
- [`coverage-summary.md`](./coverage-summary.md) — coverage numbers as of the last update, with the commands to regenerate them.
- [`changelog.md`](./changelog.md) — what was fixed, removed, or upgraded in past passes, and why, so later sessions understand why the code looks the way it does instead of re-discovering the same bugs.

## Quick orientation

This is a small full-stack app: a React/Vite frontend uploads images, a Flask API queues OCR jobs via Redis/RQ, and one or more worker processes run `pytesseract` on the images and write results back to MySQL. Everything runs in Docker Compose. See `architecture.md` for the details.
