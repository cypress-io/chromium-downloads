const Database = require('better-sqlite3');
const db = new Database('./chromium_downloads.db');

// Define the schema and create tables if they don't exist
const stmt = db.prepare(`CREATE TABLE IF NOT EXISTS builds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version TEXT,
  os TEXT,
  channel TEXT,
  timestamp TEXT,
  baseRevision TEXT,
  artifactsRevision TEXT,
  downloads TEXT
)`);
stmt.run();

module.exports = db;