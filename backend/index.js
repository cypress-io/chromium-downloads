const express = require("express");
const db = require("./db");
const scraper = require("./scraper");
const { downloadDbFromS3, uploadDbToS3 } = require('./s3');

const PORT = Number(process.env.PORT) || 3001;
const app = express();

// Middleware to allow cross-origin requests
app.use((req, res, next) => {
  res.setHeader("access-control-allow-origin", "*");
  next();
});

// Route definitions
// Assuming `db` is the sqlite3 database object and is properly initialized

app.get("/builds", async (req, res) => {
  const stmt = db.prepare("SELECT version, os, channel, timestamp FROM builds ORDER BY timestamp DESC");
  const builds = stmt.all();
  res.json(builds);
});

app.get("/builds/:version/:channel/:os", async (req, res) => {
  const { version, channel, os } = req.params;
  const stmt = db.prepare("SELECT * FROM builds WHERE channel = ? AND os = ? AND version = ?");
  const builds = stmt.all([channel, os, version]);
  if (builds.length === 0) {
    return res.sendStatus(404);
  }
  res.json(builds[0]);
});

// Server startup logic
async function startServer() {
  try {
    await downloadDbFromS3();
    console.log("Database downloaded from S3");
    scraper.start();
    console.log("Scraper started");
    app.listen(PORT, () => {
      console.log(`Backend listening on ${PORT}.`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

// Shutdown logic
async function handleShutdown() {
  try {
    await uploadDbToS3();
    console.log("Database uploaded to S3");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);

// Initialize the server
startServer();
