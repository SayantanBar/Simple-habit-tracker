# Local Docker & SQLite Persistence Guide (Ubuntu Linux)

This guide covers running the **Simple Habit Tracker** on **Ubuntu Linux** using an embedded **SQLite Database (`tracker.sqlite`)** with persistent Docker volume storage.

---

## 1. How the SQLite Database Works with Docker

- **Database Engine**: Built-in SQLite 3 engine running inside the Node.js 22 LTS container (`node:sqlite`).
- **File Location on your Ubuntu PC**: `./data/tracker.sqlite`.
- **How Volume Persistence Works**:
  The Docker volume `-v $(pwd)/data:/app/data` maps your local `./data` folder to the container's `/app/data`.
  Every checkmark, new habit, or daily note executes an ACID SQL transaction directly into `./data/tracker.sqlite`.
  When you stop, kill, or restart the container, **100% of your data remains saved in this SQLite database file**.

---

## 2. Quick Start Commands on Ubuntu

### Option A: Using Docker Compose (Single Command)
```bash
# Build image and run in detached mode
docker compose up -d --build

# View live application and database logs
docker compose logs -f

# Stop the container safely
docker compose down
```

### Option B: Using standard Docker CLI
```bash
# 1. Build the production image
docker build -t habit-tracker:latest .

# 2. Create the data directory on your Ubuntu PC
mkdir -p ./data

# 3. Run the container with volume mapped to your host
docker run -d \
  --name habit-tracker \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  --restart unless-stopped \
  habit-tracker:latest
```

Access the application in your browser:
**http://localhost:3000**

---

## 3. Inspecting Your SQLite Database Directly on Ubuntu

Because the database file lives directly on your host machine in `./data/tracker.sqlite`, you can inspect it at any time using Ubuntu's `sqlite3` CLI:

```bash
# Install sqlite3 on Ubuntu if not already installed
sudo apt-get install -y sqlite3

# Inspect tables
sqlite3 ./data/tracker.sqlite ".tables"
# Outputs: day_logs  habits    notes

# View your habits
sqlite3 ./data/tracker.sqlite "SELECT id, name, icon FROM habits;"

# View your tracking days and recorded percentages
sqlite3 ./data/tracker.sqlite "SELECT id, date_formatted, snapshot_json FROM day_logs;"
```

You can also inspect it from inside the container:
```bash
docker exec -it habit-tracker sqlite3 /app/data/tracker.sqlite "SELECT * FROM habits;"
```

---

## 4. Backups and Migration to Google Firebase

- **Backup**: Simply copy the single file `./data/tracker.sqlite` to another folder or cloud drive.
- **Firebase Ready**: The relational tables (`habits`, `day_logs`, `notes`) map directly to Google Cloud Firestore document collections for when you want to deploy live to Firebase.
