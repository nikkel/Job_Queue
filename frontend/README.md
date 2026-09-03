# Frontend

A React 19 + Vite single-page app for uploading images and tracking their OCR processing jobs.

## Available Scripts

In the project directory, run:

### `npm install`

Installs dependencies.

### `npm run start`

Runs the app in development mode with the Vite dev server on [http://localhost:3000](http://localhost:3000). Set `VITE_BACKEND_URL` to point at your API (defaults to `http://127.0.0.1:5001`).

### `npm run build`

Builds the app for production into the `dist/` folder.

### `npm run preview`

Serves the production build from `dist/` locally, for a final sanity check before deploying.

### `npm run test`

Runs the Vitest suite once with coverage (this is the command CI uses). Coverage reports are written to `coverage/` (`text` summary in the terminal, plus `html` and `lcov` reports).

### `npm run test:watch`

Runs Vitest in interactive watch mode while developing.

## Testing

Tests live alongside the code they cover (`*.test.js` / `*.test.jsx`) and use [Vitest](https://vitest.dev) + [React Testing Library](https://testing-library.com/react). API calls are mocked at the module boundary (`axios`, or the internal `Api`/`Backend` modules) rather than hitting a live backend, so the suite runs hermetically and fast. Coverage thresholds are enforced in `vite.config.js` under `test.coverage.thresholds`.
