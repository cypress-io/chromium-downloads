const db = require('./db')
const express = require('express')
const scraper = require('./scraper')

const PORT = Number(process.env.PORT) || 3001

const app = express()

app.use((req, res, next) => {
  res.setHeader('access-control-allow-origin', '*')

  next()
})

app.get('/builds', (req, res) => {
  db.Build.findAll({
    attributes: ['version', 'os', 'channel', 'timestamp'],
    order: [['timestamp', 'DESC']]
  })
  .then(builds => {
    res.json(builds)
  })
})

app.get('/builds/:version/:channel/:os', (req, res) => {
  db.Build.findAll({
    where: {
      channel: req.params.channel,
      os: req.params.os,
      version: req.params.version
    }
  })
  .then(builds => {
    if (!builds.length) {
      return res.sendStatus(404)
    }

    res.json(builds[0])
  })
})

console.log('Initializing')

db.initialize()
.then(() => {
  console.log('Starting scraping')
  scraper.start()

  app.listen(PORT, () => {
    console.log(`Backend listening on ${PORT}.`)
  })
}).catch(e => {
  console.error(e)
})
