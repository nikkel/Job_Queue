# Frontend (`frontend/`)

React 19 + Vite 8. Originally bootstrapped with Create React App, then migrated to Vite — some CRA-era conventions lingered until the 2026-09-03 cleanup pass (see `changelog.md`): JSX-in-`.js` files, a stale `babel.config.js`, a CRA-boilerplate README, `yarn.lock` alongside `package-lock.json`.

## File extension convention

Files containing JSX use `.jsx` (`App.jsx`, `index.jsx`, `components/**/*.jsx`). Plain JS modules (API client, contexts that don't render anything) stay `.js`. This matters because Vite 8's default transformer (`oxc`) does **not** treat `.js` as JSX-containing by default — the old CRA convention of JSX-in-`.js` required esbuild loader overrides in `vite.config.js` that broke on the Vite 8 upgrade. Don't reintroduce JSX in a `.js` file without adding those overrides back.

## Layout

- `src/App.jsx` — root component. Logs in as `'admin'` on mount (`Api.account.login('admin')`), shows a `CircleLoader` until that resolves, then renders `Dashboard` inside `userContext.Provider`.
- `src/components/Dashboard/Dashboard.jsx` — layout shell: heading + `UploadBox` + `TaskTable`.
- `src/components/UploadBox/UploadBox.jsx` — file input; on change, uploads via `Api.task.create(formData)` and shows a SweetAlert2 toast on success/failure.
- `src/components/TaskTable/TaskTable.jsx` — polls `Api.task.getAll()` every 5s (**does not fetch immediately on mount** — first data only appears after the first 5s tick) and renders a table; clicking a row's "View" cell opens a SweetAlert2 modal with job details.
- `src/api/backend.js` — thin axios wrapper (`get`/`post`/`put`/`patch`/`delete`), attaches `Authorization: Bearer <token>` from an in-module `token` variable (also mirrored to `localStorage`), unwraps `res.data`, normalizes errors to `Error(e.response?.data?.error ?? e.message)`.
- `src/api/account/account.js`, `src/api/task/task.js` — thin wrappers over `backend.js` for the two resource types.
- `src/contexts/userContext.js` — just the `React.createContext()` instance; consumers use React's own `useContext` hook directly (not a custom wrapper — one used to exist here and was dead code, removed).

## Testing

Vitest + React Testing Library, mocking at the API boundary (`axios`, or the internal `Api`/`Backend` modules) rather than hitting a live backend. See `testing.md` for patterns worth knowing (especially the `TaskTable` polling test approach).
