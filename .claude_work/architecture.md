# Architecture

## Components

```
                    ┌─────────────┐
   browser  ───────▶│  frontend   │  React 19 + Vite, served on :3000
                    └──────┬──────┘
                           │ HTTP (axios), VITE_BACKEND_URL
                           ▼
                    ┌─────────────┐
                    │   backend   │  Flask + Flask-RESTful, :5000 (mapped to :5001)
                    └──┬───────┬──┘
                       │       │
              SQLAlchemy       RQ (enqueue)
                       │       │
                       ▼       ▼
                 ┌─────────┐ ┌───────┐
                 │  MySQL  │ │ Redis │
                 └─────────┘ └───┬───┘
                                 │ RQ (dequeue)
                                 ▼
                          ┌─────────────┐
                          │   workers   │  scalable via `--scale workers=N`
                          └─────────────┘
                          runs pytesseract OCR, writes status/result to MySQL
```

All five services are defined in `docker-compose.yml` at the repo root. `workers` can be scaled horizontally (`docker-compose up --build --scale workers=3`) since each RQ worker just pulls jobs off the shared Redis queue independently.

## Request flow (image upload → result)

1. Frontend calls `POST /auth` with just a username (no real password check — see `util/security.py`) and gets back a JWT.
2. Frontend uploads a file to `POST /user/task` (`resources/task.py: TaskCreate`). The API opens the image with Pillow just to validate it's really an image, re-serializes it to bytes, and enqueues `process_image(image_bytes)` on the RQ queue (`util/queue.py`). A `TaskModel` row is created immediately with the RQ job's initial state.
3. A worker process (`worker.py`) picks the job off Redis, runs `util/ImageProcessing.py:process_image` (pytesseract OCR — note the hardcoded `time.sleep(15)` before OCR, presumably added to make the "processing" step visibly slow for demo purposes), and RQ stores the result on the job itself.
4. Frontend polls `GET /user/tasks` every 5 seconds (`components/TaskTable/TaskTable.jsx`). Each `TaskModel.json(update=True)` call reaches back into Redis via `update_from_queue()` to refresh status/result from the live RQ job and persists it back to MySQL.

## Auth model

There's no real password check — `util/security.py:authenticate()` looks up a user by (lowercased) username and auto-registers them if they don't exist. This is intentional per the code's own comment; it's a take-home-assignment-style auth model, not production security. JWTs use the `Bearer` scheme (Flask-JWT-Extended's default) — the frontend (`src/api/backend.js`) sends `Authorization: Bearer <token>`.
