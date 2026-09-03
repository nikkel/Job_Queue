# Changelog

## 2026-09-03 — Dependency upgrade, real test suites, CI, Dependabot auto-merge

Full pass requested by the repo owner: update all libraries (majors OK, refactor if needed), build real test coverage for both stacks, add `npm run test`/`pytest` to the docs, leave a `.claude_work` knowledge base, add CI, and add Dependabot auto-merge for all update types.

### Real bugs found and fixed

These were found while writing tests, not from a code review pass — worth knowing about since they explain behavior that looked "wrong" if you're diffing against old code:

- **`api/models/task.py`** — `find_by_id`/`find_by_user_id`/`find_by_job_id` referenced an undefined name `current_identity` (leftover from old `flask-jwt`, this project uses `flask-jwt-extended`). `find_by_id` is called live from `GET /user/task/<id>`, so that endpoint 500'd on every call for an existing task. Fixed to use `get_jwt_identity()`. `find_by_user_id`/`find_by_job_id` were also unused anywhere in the app — removed rather than fixed-and-left-dead.
- **`api/util/security.py`** — `authenticate()` looked up newly-created users by their *original, unsanitized* username instead of the lowercased one it just saved them under. Result: the first login attempt for any username with uppercase characters (e.g. `"Admin"`) failed with "Invalid credentials"; only the second attempt (after the lowercase row already existed) succeeded. Fixed to just `return user` after `save_to_db()`.
- **`api/resources/task.py`** — the invalid-image-upload error response was `{'message', 'not an image file'}` — a Python **set** literal (comma, not colon), not a dict. Flask-RESTful's JSON serializer can't serialize a `set`, so instead of a clean 404 this actually 500'd. Fixed to `{'message': 'not an image file'}`. Also removed a stray debug `print(file.filename)` and an unused `image_name` local.
- **`frontend/src/reportWebVitals.js`** — used the pre-v3 web-vitals API (`getCLS`/`getINP`/etc). Those exports were removed in web-vitals v3+; this was silently broken (never triggered since `reportWebVitals()` is called with no callback in `index.jsx`). Fixed to `onCLS`/`onINP`/etc, matching the upgraded `web-vitals` version.

### Dead/broken code removed

- `frontend/src/contexts/accountContext.js`, `frontend/src/contexts/account.js`, `frontend/src/util/AuthRoute.js` — none were imported anywhere in the running app; all referenced undefined variables or the uninstalled `react-router-dom` package.
- `frontend/src/contexts/userContext.js` — dropped an unused custom `useContext` wrapper (both call sites use React's own `useContext` hook directly).
- `frontend/babel.config.js`, `frontend/yarn.lock` — CRA-era leftovers; the project is Vite + npm only.

### Test infrastructure (previously nonfunctional)

- **Frontend**: `package.json` declared no test runner at all, yet every `*.test.js` imported `enzyme` + `enzyme-adapter-react-16` (neither installed, and incompatible with React 19 anyway). Several "tests" made real network calls to a live backend instead of mocking. Replaced entirely with Vitest + React Testing Library, mocking at the API boundary. See `testing.md` for the patterns used (especially the `TaskTable` polling test gotcha).
- **Backend**: `pytest`/`pytest-cov` weren't declared anywhere; the one existing unit test called `process_image()` with the wrong argument type (a stale signature from before the function was refactored to take raw bytes). The integration test required a live MySQL + Redis. Rebuilt to be fully hermetic (per-test temp-file SQLite, mocked RQ queue calls) — see `testing.md`.

### File renames (JSX-in-`.js` → `.jsx`)

Vite 8's default transformer (`oxc`) doesn't treat `.js` as JSX-containing by default, unlike the esbuild-loader-override hack the old `vite.config.js` used. Rather than fight the transformer, renamed every JSX-containing file to `.jsx`: `App`, `index`, `Dashboard`, `TaskTable`, `UploadBox` (and their test files). `index.html`'s script tag and `vite.config.js`'s coverage globs were updated to match. This also let the esbuild/optimizeDeps loader-override hacks in `vite.config.js` be deleted entirely.

### Dependency upgrades

All bumped to latest stable at the time (repo owner explicitly OK'd majors):

- **Frontend**: `react`/`react-dom` 19.1→19.2.8, `axios` 1.7→1.20, `sweetalert2`→11.26.25, `react-spinners` 0.15→0.17, `web-vitals` 4→6.2.1, `vite` 6→8.2.2, `@vitejs/plugin-react` 4→6.1.1. Added `type: module` to `package.json` (no CommonJS anywhere in the repo; this also silences a Vite 8 config-loader warning).
- **Backend**: `redis` 7.4→8.1, `python-dotenv`→1.2.3, `Flask-JWT-Extended`→4.7.4, `PyMySQL`→1.2.0, `cryptography` 44→50, `rq`→2.12.0, `Pillow` 11→12.3, `Flask-Cors`→6.0.5. Added an explicit `SQLAlchemy==2.0.52` pin (it's imported directly in `app.py` for `OperationalError`, so it deserves to be a direct dependency, not just transitive via Flask-SQLAlchemy).

### Other cleanup

- `frontend/.gitignore` still referenced `/build` (Create React App's output dir) instead of `/dist` (Vite's actual output dir) — `dist/` was never actually gitignored. Fixed.
- `frontend/Dockerfile` — legacy `ENV PATH value` syntax → `ENV PATH=value`; switched `npm install` → `npm ci` (now that `package-lock.json` is copied into the image, installs are reproducible).
- `api/Dockerfile.worker` — same legacy `ENV` syntax fix.
- `frontend/src/App.css` had a dangling `/*# sourceMappingURL=bootstrap.min.css.map */` comment pointing at a map file that was never included (leftover from copy-pasting Bootstrap v4's CSS in directly) — caused a noisy warning on every dev/test run. Removed the comment.

### Explicitly NOT changed (flagged, not fixed)

- **Hardcoded `FLASK_SECRET_KEY` in `api/Dockerfile`/`Dockerfile.worker`** — `docker build` itself flags this (`SecretsUsedInArgOrEnv`). Left as-is: fixing it properly means introducing a real secrets story (Compose secrets, `.env`, etc.), which is a bigger architectural change than the dependency/testing scope of this pass.
- **No input validation on `/auth`** — an empty or missing username currently just creates a blank-username user rather than rejecting the request. Not touched; wasn't a regression, and "should this be validated" is a product decision, not a bug fix.

### Infra added

- `.github/workflows/ci.yml` — runs `pytest` and `npm run test` on every PR/push to `main`.
- `.github/dependabot.yml` — weekly PRs for npm (`frontend`), pip (`api`), and github-actions ecosystems. Didn't exist before this pass.
- `.github/workflows/dependabot-automerge.yml` — auto-merges Dependabot PRs of **any** update type (explicit choice by the repo owner) once CI passes, via GitHub's native `gh pr merge --auto`. Needs two manual one-time repo settings — see the workflow file's header comment or the root README.
