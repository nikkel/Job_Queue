# Testing

Both suites are hermetic (no live MySQL/Redis/tesseract/network required) and run in CI (`.github/workflows/ci.yml`) on every PR.

## Backend — `cd api && pytest`

- Config: `api/pytest.ini` (addopts: coverage on by default, `--cov-fail-under=80`) + `api/.coveragerc` (omits `worker.py`, `tests/*`).
- Dev deps: `api/requirements-dev.txt` (`pytest`, `pytest-cov`, `pytest-mock`) — installed separately from `requirements.txt` so they never ship in the production Docker image.
- `api/tests/conftest.py` — the `app` fixture points `MYSQL_URI` at a per-test temp-file SQLite DB (`tmp_path`) via `monkeypatch.setenv`, then calls the real `create_app()`. SQLite is a fine stand-in here — the models use plain `db.Column` types with nothing MySQL-specific. Uses a real temp **file**, not `:memory:`, specifically to sidestep SQLite's per-connection `:memory:` isolation footgun with Flask-SQLAlchemy's connection pooling.
- Redis is never actually contacted: any test that reaches code touching the RQ queue patches `resources.task.queue.enqueue` / `models.task.queue.fetch_job` directly (`unittest.mock.patch`).
- The real OCR test (`tests/unit/ImageProcessing_test.py::test_process_image_real_ocr`) skips itself (`shutil.which('tesseract') is None`) if the `tesseract` binary isn't on `PATH`. CI installs it via `apt-get install tesseract-ocr` so it runs for real there; locally it'll just skip unless you have tesseract installed (`brew install tesseract` on macOS).
- Auth header note: the app uses Flask-JWT-Extended's default `Authorization: Bearer <token>` scheme. An old test used to send `Authorization: JWT <token>` and would have 401'd if it had ever actually run against a live server — worth knowing if you see that pattern anywhere else.

Current: 32 tests, 94% coverage. See `coverage-summary.md` for the per-file breakdown.

## Frontend — `cd frontend && npm run test`

- Config lives in `frontend/vite.config.js` under `test:` (Vitest reads Vite config directly). `environment: 'jsdom'`, coverage via `@vitest/coverage-v8`, thresholds set per-metric (lines/statements 80%, functions 75%, branches 70%).
- Every test mocks at the module boundary with `vi.mock(...)` — `axios` in `backend.test.js`, `../backend` in `account.test.js`/`task.test.js`, `../../api` + `sweetalert2` in the component tests. Nothing hits a real network or backend.
- **`TaskTable` polling gotcha**: the component's `useEffect` calls `setInterval(FetchList, 5000)` but does *not* call `FetchList` immediately on mount — data only appears after the first 5s tick. Using `vi.useFakeTimers()` + `vi.advanceTimersByTimeAsync()` here fights React's own scheduler (state updates land outside the fake-timer-advanced window, triggering "not wrapped in act()" warnings and flaky failures). The working pattern used in `TaskTable.test.jsx`: `vi.spyOn(global, 'setInterval').mockImplementation((fn) => { fn(); return 0; })` to fire the callback synchronously on mount, then use real-timer-based `screen.findByText(...)` to await the resulting state update. Reuse this pattern for any other polling-based component tests.
- `package.json` scripts: `test` = `vitest run --coverage` (what CI runs), `test:watch` = `vitest` (interactive).

Current: 34 tests, 100% statements/functions/lines, ~91% branches. See `coverage-summary.md`.

## CI (`.github/workflows/ci.yml`)

Two independent jobs, `backend-tests` and `frontend-tests`, both triggered on `pull_request`/`push` to `main`. Job display names (`Backend tests (pytest)`, `Frontend tests (vitest)`) are what you'd reference as required status checks in branch protection.

## Dependabot auto-merge (`.github/workflows/dependabot-automerge.yml`)

Configured to auto-merge **all** Dependabot update types (patch/minor/major) once CI passes — this was an explicit choice by the repo owner, not a default. Uses GitHub's native `gh pr merge --auto`, which means it's gated by branch protection required checks, not by the workflow itself. Requires two manual one-time repo settings (documented in the workflow file's header comment and the root README) that can't be set from a workflow file: "Allow auto-merge" under General settings, and a branch protection rule on `main` requiring the two CI job checks.
