const Sequelize = require('sequelize')

const DATABASE_URL = process.env.DATABASE_URL

const sequelize = new Sequelize(DATABASE_URL)

class Build extends Sequelize.Model {}
Build.init({
  version: Sequelize.STRING,
  os: Sequelize.STRING,
  channel: Sequelize.STRING,
  timestamp: Sequelize.DATE,
  downloads: Sequelize.JSONB
}, {
  sequelize,
  modelName: 'builds',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['version', 'os', 'channel', 'timestamp']
    }
  ],
  pool: {
    max: 4,
    min: 1
  }
})

function initialize() {
  return sequelize.sync()
}

module.exports = {
  initialize,
  Build
}
