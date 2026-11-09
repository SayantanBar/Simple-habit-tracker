# Embedded SQLite Database & Docker Volume Persistence

An architectural plan to upgrade the backend to an embedded SQLite database engine (`tracker.sqlite`) stored directly inside the mounted Docker volume (`/app/data/tracker.sqlite` mapped to `./data/tracker.sqlite` on Ubuntu Linux). Uses Node.js 22 LTS with built-in SQLite engine (`node:sqlite`) for zero-overhead, production-grade SQL reliability and ACID transactions.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following plan has been aligned with your exact choices:

- **Database Engine**: Embedded SQLite database (`node:sqlite` in Node.js 22 LTS).
- **Physical File Storage**: Persisted directly to `/app/data/tracker.sqlite` which mounts to `./data/tracker.sqlite` on your Ubuntu host.
- **Data Persistence**:
  - Stopping or restarting the container (`docker compose down`, `docker compose up`) leaves the SQLite database on your host intact.
  - Zero data loss on container stops, reloads, or restarts.
- **Docker Image**: Multi-stage `node:22-alpine` providing native SQLite support with zero external compiler dependencies.
- **Firebase Ready**: The SQLite queries and API endpoints are cleanly decoupled behind a repository interface, making it effortless to switch to Google Firebase Firestore when deploying to the cloud.

---

## 1. Overview & Core Concept

- **Native SQL Engine**: Rather than generic JSON files, the backend uses a true relational SQLite database (`tracker.sqlite`) with structured tables, indexes, and atomic transactions.
- **Host Volume Integrity**: Because `./data` is mounted to `/app/data`, SQLite writes write-ahead logs (WAL) and database pages directly onto your Ubuntu Linux machine.

---

## 2. Technical Architecture & Database Schema

### SQLite Relational Schema (`tracker.sqlite`)

```sql
-- 1. Habits Table
CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  order_num INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

-- 2. Daily Tracking Logs Table (with frozen snapshots)
CREATE TABLE IF NOT EXISTS day_logs (
  id TEXT PRIMARY KEY,             -- ISO date (e.g. '2026-11-09')
  date_formatted TEXT NOT NULL,    -- Display string (e.g. 'November 9, 2026')
  checks_json TEXT NOT NULL,       -- JSON string of habit checkboxes
  snapshot_json TEXT,              -- JSON string of immutable historical snapshot
  created_at TEXT NOT NULL
);

-- 3. Notes & Daily TODOs Table
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  completed INTEGER NOT NULL,      -- 0 for false, 1 for true
  created_at TEXT NOT NULL
);
```

### Component Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Ubuntu Host Machine                             │
│                ./data/tracker.sqlite (SQLite Database)                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Docker Volume: -v $(pwd)/data:/app/data)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               Docker Container (node:22-alpine on Port 3000)          │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Express API (`server.ts`)                                        │  │
│  │ - GET  /api/db  -> Queries SQLite (habits, day_logs, notes)      │  │
│  │ - POST /api/db  -> Atomic SQLite Transaction (INSERT/UPDATE)     │  │
│  │ - Writes directly to /app/data/tracker.sqlite                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                   │                                    │
│                                   ▼                                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Static Assets (`/dist`)                                          │  │
│  │ - Vite production bundle served on port 3000                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Implementation Plan

1. **Database Module (`server.ts`)**:
   - Initialize SQLite connection with `DatabaseSync(DB_PATH)`.
   - Run `CREATE TABLE IF NOT EXISTS` migrations on server boot.
   - Seed default habits and notes only if the database is newly initialized.
   - Implement `GET /api/db` to query tables and return the combined payload.
   - Implement `POST /api/db` wrapped in an atomic SQL transaction to upsert habits, day logs, and notes.
2. **Dockerfile & Docker Compose**:
   - Update base image to `node:22-alpine` across builder and runner stages.
   - Ensure `/app/data` volume mount points to the SQLite database file.
3. **Documentation**:
   - Update `DOCKER_GUIDE.md` explaining how `tracker.sqlite` is stored on your Ubuntu machine, how to inspect it with `sqlite3` CLI, and how to back it up.
