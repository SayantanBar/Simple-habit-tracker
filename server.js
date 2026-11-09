// server.ts
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { DatabaseSync } from "node:sqlite";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = Number(process.env.PORT) || 3e3;
var DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
var PRIMARY_DB_FILE = process.env.DB_PATH || path.join(DATA_DIR, "tracker.sqlite");
var DB_FILE = PRIMARY_DB_FILE;
function openSqliteDatabase() {
  const candidatePaths = [
    PRIMARY_DB_FILE,
    path.join(process.cwd(), "data", "tracker.sqlite"),
    path.join(process.cwd(), "tracker.sqlite"),
    "/tmp/tracker.sqlite"
  ];
  for (const candidate of candidatePaths) {
    try {
      const dir = path.dirname(candidate);
      if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
        console.warn(`Warning: ${candidate} is a directory, not a file. Removing directory...`);
        fs.rmSync(candidate, { recursive: true, force: true });
      }
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true, mode: 511 });
      }
      try {
        fs.chmodSync(dir, 511);
      } catch {
      }
      const instance = new DatabaseSync(candidate);
      try {
        instance.exec("PRAGMA journal_mode = WAL;");
      } catch {
        try {
          instance.exec("PRAGMA journal_mode = DELETE;");
        } catch {
        }
      }
      DB_FILE = candidate;
      console.log(`[Database] SQLite connected successfully at: ${candidate}`);
      return instance;
    } catch (err) {
      console.warn(`[Database] Could not open SQLite database at ${candidate} (${err?.message || err}). Trying next path...`);
    }
  }
  console.warn("[Database] Falling back to in-memory SQLite database.");
  DB_FILE = ":memory:";
  return new DatabaseSync(":memory:");
}
var db = openSqliteDatabase();
db.exec(`
  CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    order_num INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS day_logs (
    id TEXT PRIMARY KEY,
    date_formatted TEXT NOT NULL,
    checks_json TEXT NOT NULL,
    snapshot_json TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    completed INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );
`);
try {
  const countStmt = db.prepare("SELECT COUNT(*) as count FROM habits");
  const habitCount = countStmt.get()?.count || 0;
  if (habitCount === 0) {
    const insertHabit = db.prepare(
      "INSERT INTO habits (id, name, icon, order_num, created_at) VALUES (?, ?, ?, ?, ?)"
    );
    insertHabit.run("h-sleep", "Sleep 8 Hours", "\u{1F6CF}\uFE0F", 1, "2026-10-01T00:00:00.000Z");
    insertHabit.run("h-nutrition", "Healthy Nutrition", "\u{1F374}", 2, "2026-10-01T00:00:00.000Z");
    insertHabit.run("h-walk", "Morning Walk / Exercise", "\u{1F6B6}", 3, "2026-10-01T00:00:00.000Z");
    insertHabit.run("h-study", "Morning Kubernetes Lecture", "\u{1F4D3}", 4, "2026-10-01T00:00:00.000Z");
    insertHabit.run("h-problems", "Solve escbash.com problems", "\u{1F3CB}\uFE0F", 5, "2026-10-01T00:00:00.000Z");
    insertHabit.run("h-water", "Hydration 2.5L Water", "\u{1F4A7}", 6, "2026-10-01T00:00:00.000Z");
    const insertDay = db.prepare(
      "INSERT INTO day_logs (id, date_formatted, checks_json, snapshot_json, created_at) VALUES (?, ?, ?, ?, ?)"
    );
    insertDay.run(
      "2026-11-09",
      "November 9, 2026",
      JSON.stringify({ "h-nutrition": true, "h-problems": true }),
      JSON.stringify({
        percentage: 33,
        completedCount: 2,
        totalHabitsCount: 6,
        activeHabitIds: ["h-sleep", "h-nutrition", "h-walk", "h-study", "h-problems", "h-water"],
        savedAt: "2026-11-09T08:00:00.000Z"
      }),
      (/* @__PURE__ */ new Date("2026-11-09T00:05:00")).toISOString()
    );
    insertDay.run(
      "2026-11-08",
      "November 8, 2026",
      JSON.stringify({ "h-sleep": true, "h-nutrition": true, "h-walk": true, "h-study": true }),
      JSON.stringify({
        percentage: 67,
        completedCount: 4,
        totalHabitsCount: 6,
        activeHabitIds: ["h-sleep", "h-nutrition", "h-walk", "h-study", "h-problems", "h-water"],
        savedAt: "2026-11-08T23:59:00.000Z"
      }),
      (/* @__PURE__ */ new Date("2026-11-08T00:05:00")).toISOString()
    );
    insertDay.run(
      "2026-10-30",
      "October 30, 2026",
      JSON.stringify({ "h-sleep": true, "h-walk": true, "h-study": true }),
      JSON.stringify({
        percentage: 50,
        completedCount: 3,
        totalHabitsCount: 6,
        activeHabitIds: ["h-sleep", "h-nutrition", "h-walk", "h-study", "h-problems", "h-water"],
        savedAt: "2026-10-30T23:59:00.000Z"
      }),
      (/* @__PURE__ */ new Date("2026-10-30T00:05:00")).toISOString()
    );
    const insertNote = db.prepare(
      "INSERT INTO notes (id, text, completed, created_at) VALUES (?, ?, ?, ?)"
    );
    insertNote.run("n-1", "Activate the automatic cat feeder and buy new cans of tuna.", 0, (/* @__PURE__ */ new Date()).toISOString());
    insertNote.run("n-2", "Check to make sure everything is in place", 0, (/* @__PURE__ */ new Date()).toISOString());
    insertNote.run("n-3", "Not forget to put my winter playlist in my official library and get all the songs saved in case of stockage loss", 0, (/* @__PURE__ */ new Date()).toISOString());
    insertNote.run("n-4", "To lock the front and back doors", 0, (/* @__PURE__ */ new Date()).toISOString());
    insertNote.run("n-5", "Book the restaurant table and prepare surprise for my friends.", 0, (/* @__PURE__ */ new Date()).toISOString());
  }
} catch (seedErr) {
  console.warn("Notice during database initial seeding:", seedErr);
}
app.use(express.json({ limit: "10mb" }));
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    database: "sqlite",
    databaseFile: DB_FILE,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/db", (_req, res) => {
  try {
    const habitsRows = db.prepare("SELECT id, name, icon, order_num, created_at FROM habits ORDER BY order_num ASC").all();
    const habits = habitsRows.map((r) => ({
      id: r.id,
      name: r.name,
      icon: r.icon,
      order: r.order_num,
      createdAt: r.created_at
    }));
    const daysRows = db.prepare("SELECT id, date_formatted, checks_json, snapshot_json, created_at FROM day_logs ORDER BY id DESC").all();
    const dayLogs = daysRows.map((r) => ({
      id: r.id,
      dateFormatted: r.date_formatted,
      checks: JSON.parse(r.checks_json || "{}"),
      snapshot: r.snapshot_json ? JSON.parse(r.snapshot_json) : void 0,
      createdAt: r.created_at
    }));
    const notesRows = db.prepare("SELECT id, text, completed, created_at FROM notes ORDER BY created_at ASC").all();
    const notes = notesRows.map((r) => ({
      id: r.id,
      text: r.text,
      completed: Boolean(r.completed),
      createdAt: r.created_at
    }));
    return res.json({ habits, dayLogs, notes });
  } catch (err) {
    console.error("Failed to query SQLite database:", err);
    return res.status(500).json({ error: "Failed to read from SQLite database" });
  }
});
app.post("/api/db", (req, res) => {
  try {
    const { habits, dayLogs, notes } = req.body;
    db.exec("BEGIN TRANSACTION;");
    if (Array.isArray(habits)) {
      db.exec("DELETE FROM habits;");
      const insertHabit = db.prepare(
        "INSERT INTO habits (id, name, icon, order_num, created_at) VALUES (?, ?, ?, ?, ?)"
      );
      for (const h of habits) {
        insertHabit.run(
          h.id,
          h.name,
          h.icon,
          h.order || 0,
          h.createdAt || (/* @__PURE__ */ new Date()).toISOString()
        );
      }
    }
    if (Array.isArray(dayLogs)) {
      db.exec("DELETE FROM day_logs;");
      const insertDay = db.prepare(
        "INSERT INTO day_logs (id, date_formatted, checks_json, snapshot_json, created_at) VALUES (?, ?, ?, ?, ?)"
      );
      for (const d of dayLogs) {
        insertDay.run(
          d.id,
          d.dateFormatted,
          JSON.stringify(d.checks || {}),
          d.snapshot ? JSON.stringify(d.snapshot) : null,
          d.createdAt || (/* @__PURE__ */ new Date()).toISOString()
        );
      }
    }
    if (Array.isArray(notes)) {
      db.exec("DELETE FROM notes;");
      const insertNote = db.prepare(
        "INSERT INTO notes (id, text, completed, created_at) VALUES (?, ?, ?, ?)"
      );
      for (const n of notes) {
        insertNote.run(
          n.id,
          n.text,
          n.completed ? 1 : 0,
          n.createdAt || (/* @__PURE__ */ new Date()).toISOString()
        );
      }
    }
    db.exec("COMMIT;");
    return res.json({
      success: true,
      database: "sqlite",
      savedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (err) {
    try {
      db.exec("ROLLBACK;");
    } catch {
    }
    console.error("Failed to write transaction to SQLite:", err);
    return res.status(500).json({ error: "Failed to update SQLite database" });
  }
});
var distPath = path.join(process.cwd(), "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Habit Tracker server running on http://0.0.0.0:${PORT}`);
  console.log(`SQLite database active at: ${DB_FILE}`);
});
