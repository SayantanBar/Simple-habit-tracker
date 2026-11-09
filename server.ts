import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Data directory and SQLite database path (mounted via Docker volume -v $(pwd)/data:/app/data)
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DB_FILE = process.env.DB_PATH || path.join(DATA_DIR, 'tracker.sqlite');

// Ensure data directory exists on disk
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize embedded SQLite database
const db = new DatabaseSync(DB_FILE);

// Enable WAL mode (Write-Ahead Logging) for superior concurrent read/write and persistence
db.exec('PRAGMA journal_mode = WAL;');

// Initialize SQLite schema with structured relational tables
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

// Seed initial template if SQLite database was just created
const countStmt = db.prepare('SELECT COUNT(*) as count FROM habits');
const habitCount = (countStmt.get() as any)?.count || 0;
if (habitCount === 0) {
  const insertHabit = db.prepare(
    'INSERT INTO habits (id, name, icon, order_num, created_at) VALUES (?, ?, ?, ?, ?)'
  );
  insertHabit.run('h-sleep', 'Sleep 8 Hours', '🛏️', 1, '2026-10-01T00:00:00.000Z');
  insertHabit.run('h-nutrition', 'Healthy Nutrition', '🍴', 2, '2026-10-01T00:00:00.000Z');
  insertHabit.run('h-walk', 'Morning Walk / Exercise', '🚶', 3, '2026-10-01T00:00:00.000Z');
  insertHabit.run('h-study', 'Morning Kubernetes Lecture', '📓', 4, '2026-10-01T00:00:00.000Z');
  insertHabit.run('h-problems', 'Solve escbash.com problems', '🏋️', 5, '2026-10-01T00:00:00.000Z');
  insertHabit.run('h-water', 'Hydration 2.5L Water', '💧', 6, '2026-10-01T00:00:00.000Z');

  const insertDay = db.prepare(
    'INSERT INTO day_logs (id, date_formatted, checks_json, snapshot_json, created_at) VALUES (?, ?, ?, ?, ?)'
  );
  insertDay.run(
    '2026-11-09',
    'November 9, 2026',
    JSON.stringify({ 'h-nutrition': true, 'h-problems': true }),
    JSON.stringify({
      percentage: 33,
      completedCount: 2,
      totalHabitsCount: 6,
      activeHabitIds: ['h-sleep', 'h-nutrition', 'h-walk', 'h-study', 'h-problems', 'h-water'],
      savedAt: '2026-11-09T08:00:00.000Z',
    }),
    new Date('2026-11-09T00:05:00').toISOString()
  );
  insertDay.run(
    '2026-11-08',
    'November 8, 2026',
    JSON.stringify({ 'h-sleep': true, 'h-nutrition': true, 'h-walk': true, 'h-study': true }),
    JSON.stringify({
      percentage: 67,
      completedCount: 4,
      totalHabitsCount: 6,
      activeHabitIds: ['h-sleep', 'h-nutrition', 'h-walk', 'h-study', 'h-problems', 'h-water'],
      savedAt: '2026-11-08T23:59:00.000Z',
    }),
    new Date('2026-11-08T00:05:00').toISOString()
  );
  insertDay.run(
    '2026-10-30',
    'October 30, 2026',
    JSON.stringify({ 'h-sleep': true, 'h-walk': true, 'h-study': true }),
    JSON.stringify({
      percentage: 50,
      completedCount: 3,
      totalHabitsCount: 6,
      activeHabitIds: ['h-sleep', 'h-nutrition', 'h-walk', 'h-study', 'h-problems', 'h-water'],
      savedAt: '2026-10-30T23:59:00.000Z',
    }),
    new Date('2026-10-30T00:05:00').toISOString()
  );

  const insertNote = db.prepare(
    'INSERT INTO notes (id, text, completed, created_at) VALUES (?, ?, ?, ?)'
  );
  insertNote.run('n-1', 'Activate the automatic cat feeder and buy new cans of tuna.', 0, new Date().toISOString());
  insertNote.run('n-2', 'Check to make sure everything is in place', 0, new Date().toISOString());
  insertNote.run('n-3', 'Not forget to put my winter playlist in my official library and get all the songs saved in case of stockage loss', 0, new Date().toISOString());
  insertNote.run('n-4', 'To lock the front and back doors', 0, new Date().toISOString());
  insertNote.run('n-5', 'Book the restaurant table and prepare surprise for my friends.', 0, new Date().toISOString());
}

app.use(express.json({ limit: '10mb' }));

// Healthcheck endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    database: 'sqlite',
    databaseFile: DB_FILE,
    timestamp: new Date().toISOString() 
  });
});

// GET /api/db - Query all tables from SQLite
app.get('/api/db', (_req: Request, res: Response) => {
  try {
    const habitsRows = db
      .prepare('SELECT id, name, icon, order_num, created_at FROM habits ORDER BY order_num ASC')
      .all() as any[];

    const habits = habitsRows.map((r) => ({
      id: r.id,
      name: r.name,
      icon: r.icon,
      order: r.order_num,
      createdAt: r.created_at,
    }));

    const daysRows = db
      .prepare('SELECT id, date_formatted, checks_json, snapshot_json, created_at FROM day_logs ORDER BY id DESC')
      .all() as any[];

    const dayLogs = daysRows.map((r) => ({
      id: r.id,
      dateFormatted: r.date_formatted,
      checks: JSON.parse(r.checks_json || '{}'),
      snapshot: r.snapshot_json ? JSON.parse(r.snapshot_json) : undefined,
      createdAt: r.created_at,
    }));

    const notesRows = db
      .prepare('SELECT id, text, completed, created_at FROM notes ORDER BY created_at ASC')
      .all() as any[];

    const notes = notesRows.map((r) => ({
      id: r.id,
      text: r.text,
      completed: Boolean(r.completed),
      createdAt: r.created_at,
    }));

    return res.json({ habits, dayLogs, notes });
  } catch (err) {
    console.error('Failed to query SQLite database:', err);
    return res.status(500).json({ error: 'Failed to read from SQLite database' });
  }
});

// POST /api/db - Atomically update SQLite database within a transaction
app.post('/api/db', (req: Request, res: Response) => {
  try {
    const { habits, dayLogs, notes } = req.body;

    db.exec('BEGIN TRANSACTION;');

    if (Array.isArray(habits)) {
      db.exec('DELETE FROM habits;');
      const insertHabit = db.prepare(
        'INSERT INTO habits (id, name, icon, order_num, created_at) VALUES (?, ?, ?, ?, ?)'
      );
      for (const h of habits) {
        insertHabit.run(
          h.id, 
          h.name, 
          h.icon, 
          h.order || 0, 
          h.createdAt || new Date().toISOString()
        );
      }
    }

    if (Array.isArray(dayLogs)) {
      db.exec('DELETE FROM day_logs;');
      const insertDay = db.prepare(
        'INSERT INTO day_logs (id, date_formatted, checks_json, snapshot_json, created_at) VALUES (?, ?, ?, ?, ?)'
      );
      for (const d of dayLogs) {
        insertDay.run(
          d.id,
          d.dateFormatted,
          JSON.stringify(d.checks || {}),
          d.snapshot ? JSON.stringify(d.snapshot) : null,
          d.createdAt || new Date().toISOString()
        );
      }
    }

    if (Array.isArray(notes)) {
      db.exec('DELETE FROM notes;');
      const insertNote = db.prepare(
        'INSERT INTO notes (id, text, completed, created_at) VALUES (?, ?, ?, ?)'
      );
      for (const n of notes) {
        insertNote.run(
          n.id, 
          n.text, 
          n.completed ? 1 : 0, 
          n.createdAt || new Date().toISOString()
        );
      }
    }

    db.exec('COMMIT;');

    return res.json({ 
      success: true, 
      database: 'sqlite',
      savedAt: new Date().toISOString() 
    });
  } catch (err) {
    db.exec('ROLLBACK;');
    console.error('Failed to write transaction to SQLite:', err);
    return res.status(500).json({ error: 'Failed to update SQLite database' });
  }
});

// Serve frontend static assets in production
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Habit Tracker server running on http://0.0.0.0:${PORT}`);
  console.log(`Embedded SQLite database: ${DB_FILE}`);
});
