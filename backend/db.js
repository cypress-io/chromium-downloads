const Sequelize = require("sequelize");

let DATABASE_URL = process.env.DATABASE_URL;

if (process.env.NODE_ENV === "production") {
  DATABASE_URL += "?ssl=true";
}

const sequelize = new Sequelize(DATABASE_URL);

class Build extends Sequelize.Model {}
Build.init(
  {
    version: Sequelize.STRING,
    os: Sequelize.STRING,
    channel: Sequelize.STRING,
    timestamp: Sequelize.DATE,
    baseRevision: Sequelize.STRING,
    artifactsRevision: Sequelize.STRING,
    downloads: Sequelize.JSONB,
  },
  {
    sequelize,
    modelName: "builds",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["version", "os", "channel", "timestamp"],
      },
    ],
    pool: {
      max: 4,
      min: 1,
    },
  }
);

async function initialize() {
  console.log(sequelize);
  sequelize.sync();
}

module.exports = {
  initialize,
  Build,
};
