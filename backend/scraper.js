const { getBuilds } = require('./get-chromium-builds')
const Promise = require('bluebird')

const db = require('./db');

function saveBuild(build) {
  const { version, os, channel, timestamp, baseRevision, artifactsRevision, downloads } = build;
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
    INSERT INTO builds (version, os, channel, timestamp, baseRevision, artifactsRevision, downloads)
    SELECT ?, ?, ?, ?, ?, ?, ?
    WHERE NOT EXISTS (
      SELECT 1 FROM builds WHERE version = ? AND os = ? AND channel = ?
    )
  `);
    const params = [
      version, os, channel, timestamp, baseRevision, artifactsRevision, JSON.stringify(downloads),
      version, os, channel // These are for the WHERE NOT EXISTS subquery
    ];

    stmt.run(params);
  });
}

function scrape() {
  console.log('Getting builds')
  return getBuilds()
  .then(builds => {
    return Promise.map(builds, (build) => {
      console.log(`Getting downloads for Chromium ${build.version} ${build.channel} on ${build.os}`)
      return build.getDownloads()
      .then(({ downloads, base, foundBase }) => {
        console.log(`Received downloads for Chromium ${build.version} ${build.channel} on ${build.os}`)
        build.downloads = downloads
        build.baseRevision = base
        build.artifactsRevision = foundBase
        return build
      })
      .then(saveBuild)
      .catch((error) => {
        console.error(`Had an error storing downloads for Chromium ${build.version} ${build.channel} on ${build.os}:`, error.message);
      })
    })
  })
}

function start() {
  return scrape()
  .then(() => {
    return Promise.delay(5 * 60 * 1000)
  })
  .then(start)
}

module.exports = {
  start
}
