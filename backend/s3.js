// backend/s3.js
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1'
  });

const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const DB_FILE_NAME = 'chromium_downloads.db';
const SKIP_S3_INTEGRATION = process.env.SKIP_S3_INTEGRATION === 'true';

async function uploadDbToS3() {
  if (SKIP_S3_INTEGRATION) {
    return;
  }

  const fileStream = fs.createReadStream(DB_FILE_NAME);
  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: DB_FILE_NAME,
    Body: fileStream
  };
  const upload = new Upload({
    client: s3Client,
    params: uploadParams
  });

  await upload.done();
}

async function downloadDbFromS3() {
  if (SKIP_S3_INTEGRATION) {
    return;
  }

  const getObjectParams = {
    Bucket: BUCKET_NAME,
    Key: DB_FILE_NAME
  };
  try {
    const { Body } = await s3Client.send(new GetObjectCommand(getObjectParams));
    const fileStream = Body.pipe(fs.createWriteStream(DB_FILE_NAME));
    await new Promise((resolve, reject) => {
      fileStream.on('error', reject);
      fileStream.on('close', resolve);
    });
  } catch (err) {
    if (err.name === 'NoSuchKey') {
      // Create an empty file
      fs.writeFileSync(DB_FILE_NAME, '');
      // Initialize the database and create the builds table
      const db = new sqlite3.Database(DB_FILE_NAME);
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
            console.log('Successfully created the builds table in new DB file');
          }
        });
      });
      db.close();
    } else {
      throw err;
    }
  }
}

module.exports = { uploadDbToS3, downloadDbFromS3 };