# Backend (`api/`)

Flask 3 + Flask-RESTful API, SQLAlchemy/MySQL for persistence, Redis/RQ for the job queue, pytesseract for OCR. Python 3.13.

## Layout

- `app.py` — `create_app()` factory: sets up Flask, CORS, JWT, SQLAlchemy, registers routes, and retries `db.create_all()` up to 10 times (3s apart) to ride out MySQL not being ready yet in Compose. The `/auth` route lives inline here.
- `resources/index.py` — trivial `Index` resource, one handler per HTTP verb, used as a liveness check (`GET /` etc.).
- `resources/task.py` — `Task` (get one / delete), `TaskCreate` (upload + enqueue), `TaskList` (list current user's tasks).
- `models/task.py` — `TaskModel`: the DB row plus queue-refresh logic (`update_from_queue`, `get_job_position`, `json()`).
- `models/user.py` — `UserModel`: just id + username.
- `util/db.py` — the shared `SQLAlchemy()` instance.
- `util/queue.py` — the shared RQ `Queue` bound to Redis (`REDIS_URI` env var). Connection is lazy (`redis.from_url` doesn't connect until first command), so importing this module never requires a live Redis.
- `util/security.py` — `authenticate()` (see auth model note in `architecture.md`) and `identify()`.
- `util/ImageProcessing.py` — `process_image(image_bytes)`: sleeps 15s, then runs `pytesseract.image_to_string`, returns `f'Error: {e}'` string (not a raised exception) on failure.
- `worker.py` — RQ worker entrypoint (`python3 worker.py`), scaled via `docker-compose --scale workers=N`. Excluded from coverage (`.coveragerc`) since it's a blocking `Worker.work()` script, not something to unit test.

## Config / env vars

`MYSQL_URI`, `REDIS_URI`, `FLASK_SECRET_KEY` — all read via `os.getenv` with dev defaults in `app.py`/`util/queue.py`. Docker Compose and the Dockerfiles set real values; **the Dockerfiles hardcode `FLASK_SECRET_KEY` in plaintext** (flagged by `docker build`'s own linter as `SecretsUsedInArgOrEnv`). Left as-is — fixing it means introducing a real secrets story (Compose secrets, `.env`, etc.), which is a bigger change than was in scope for the dependency/testing pass. Worth doing before this goes anywhere near production.

## Bugs found and fixed (2026-09-03 pass)

See `changelog.md` for the full list — the short version: `models/task.py` referenced an undefined `current_identity` (dead flask-jwt-era code, now uses `get_jwt_identity()`), `util/security.py` had a case-sensitivity bug that failed first-time login for any non-lowercase username, and `resources/task.py` returned a Python **set** literal (`{'message', 'not an image file'}`) instead of a dict on invalid-image upload, which crashed JSON serialization instead of returning a clean 404.

## Testing

Fully hermetic — no live MySQL/Redis/tesseract required. See `testing.md`.
