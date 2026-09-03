# Job queue application

- Task: Implement a javascript frontend and python backend to process images to text.
- Position: Learning and Development Devops Automation Engineer

## Constraints

---

- You have to complete the task independently
- The frontend should be implemented in React preferably, but other modern frameworks are accceptable.
- The backend should be implemented in Python
- You must use a Git repository and commit frequently
- There is no time limit for this assignment
- Each separate part (Frontend/Backend) must be in their own docker container

## Evaluation

---

- We expect the application to handle multiple incoming job requests.
- The primary goal of this exercise is to see how you handle the connection and communication between multiple systems.
- The code you deliver will be evaluated and we will be doing a review with you.

## Main Tasks

---

- Implement a frontend that allows a user to upload images for processing.
- The frontend should give an overview of jobs in progress.
- Implement a backend that can accept these images and pass them to the ImageProcess module.
- It should be possible to start multiple jobs at the same time.

## Bonus tasks

---

## Run Commands

```
docker-compose up --build --scale workers=3
docker-compose down -v && docker-compose up --build
```

## Running Tests

Backend (Python/pytest, run from `api/`):

```
cd api
pip install -r requirements.txt -r requirements-dev.txt
pytest
```

Frontend (Vitest, run from `frontend/`):

```
cd frontend
npm install
npm run test
```

Both commands run their full suite with coverage and are what CI runs on every pull request (see `.github/workflows/ci.yml`).

## Dependabot Auto-merge

`.github/dependabot.yml` opens weekly PRs for npm (`frontend`), pip (`api`), and GitHub Actions updates. `.github/workflows/dependabot-automerge.yml` auto-merges those PRs (any update type, including major) once the CI checks above pass. This requires two one-time repo settings that can't be set from a workflow file:

1. Settings → General → Pull Requests → enable "Allow auto-merge".
2. Settings → Branches → add a protection rule for `main` requiring the `Backend tests (pytest)` and `Frontend tests (vitest)` status checks.