const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./chromium_downloads.db');

// Define the schema and create tables if they don't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS builds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version TEXT,
    os TEXT,
    channel TEXT,
    timestamp TEXT,
    baseRevision TEXT,
    artifactsRevision TEXT,
    downloads TEXT
  )`, (err) => {
    if (err) {
      console.error('Error creating builds table', err);
    } else {
      console.log('Successfully ensured the builds table exists');
    }
  });
});

module.exports = db;