# Coverage Summary

Captured 2026-09-03, from real test runs (not estimates). Regenerate with the commands below — numbers will drift as code changes, so don't trust this file blindly; re-run if it's been a while.

## Backend — `cd api && pytest`

32 tests passed. Threshold: `--cov-fail-under=80` (in `pytest.ini`). Actual: **94.27%**.

```
Name                      Stmts   Miss  Cover   Missing
-------------------------------------------------------
app.py                       46      2    96%   42, 65
models/__init__.py            0      0   100%
models/task.py                73      6    92%   60-61, 65-66, 88, 114
models/user.py                19      0   100%
resources/__init__.py          0      0   100%
resources/index.py            13      0   100%
resources/task.py             43      3    93%   33, 71-72
util/ImageProcessing.py       14      2    86%   3-4
util/__init__.py               0      0   100%
util/db.py                     2      0   100%
util/queue.py                  5      0   100%
util/security.py              12      0   100%
-------------------------------------------------------
TOTAL                        227     13    94%
```

Uncovered lines are mostly defensive/unreachable-in-practice branches: `app.py:42,65` are the `__main__` guard and the retry-exhausted edge (tested indirectly, exact line numbers shift), `util/ImageProcessing.py:3-4` is the Python-2-style `import Image` fallback for missing PIL (dead code path, PIL is always installed), `models/task.py` misses are `except Exception: pass` fallback branches within `update_from_queue`.

## Frontend — `cd frontend && npm run test`

34 tests passed. Thresholds (in `vite.config.js`): lines/statements 80%, functions 75%, branches 70%.

```
File               | % Stmts | % Branch | % Funcs | % Lines
--------------------|---------|----------|---------|--------
All files           |     100 |    90.69 |     100 |    100
 src/api/backend.js |     100 |    88.23 |     100 |    100   (lines 39,50,61,72 — a couple of the
                                                                 res.data ?? res fallback branches on
                                                                 delete/put/patch specifically)
```

Every other file (`App.jsx`, `Dashboard.jsx`, `TaskTable.jsx`, `UploadBox.jsx`, `account.js`, `task.js`, `userContext.js`) is at 100% on all four metrics — the text reporter only prints rows with something uncovered, so a clean run's table is short by design, not because files are missing from instrumentation.

## Regenerating

```
cd api && pytest                 # backend, prints table + writes coverage.xml
cd frontend && npm run test      # frontend, prints table + writes coverage/ (html + lcov)
```
