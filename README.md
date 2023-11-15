chromium-downloads
==========

[![Build Status](https://travis-ci.org/flotwig/chromium-downloads.svg?branch=master)](https://travis-ci.org/flotwig/chromium-downloads)

Live at: https://chromium.cypress.io

![image](https://user-images.githubusercontent.com/1151760/52878049-c29d0000-3129-11e9-8c71-e9497fc7a253.png)

### Installing dependencies

```
yarn
```

### Starting the dev server

```
SKIP_S3_INTEGRATION=true yarn start
```

### Running

```shell
yarn start
```

The application uses several environment variables to configure its behavior:

- `REACT_APP_API_URL`: This variable is used to set the API URL for the frontend. It is defined in frontend/src/index.js. If not set, it defaults to 'http://localhost:3001'.

- `PORT`: This variable is used to set the port on which the backend server listens. It is defined in backend/index.js. If not set, it defaults to 3001.

- `AWS_REGION`: This variable is used to set the AWS region for the S3 client. It is defined in backend/s3.js. If not set, it defaults to 'us-east-1'.

- `S3_BUCKET_NAME`: This variable is used to set the name of the S3 bucket where the database file is stored. It is defined in backend/s3.js. There is no default value, so it must be set.

- `SKIP_S3_INTEGRATION`: This variable is used to skip the integration with S3 for downloading and uploading the database file. It is defined in backend/s3.js and backend/index.js. If not set, it defaults to false.

Please note that the `SKIP_S3_INTEGRATION` environment variable is used in the yarn start command above to run the application without S3 integration. This is useful for local development when you don't want to connect to S3.
