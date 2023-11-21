# Chromium Downloads
==========

[![Build Status](https://travis-ci.org/flotwig/chromium-downloads.svg?branch=master)](https://travis-ci.org/flotwig/chromium-downloads)

Live at: https://chromium.cypress.io

![image](https://user-images.githubusercontent.com/1151760/52878049-c29d0000-3129-11e9-8c71-e9497fc7a253.png)

This application is a tool for tracking and downloading Chromium builds. It scrapes build data from the Chromium project and provides a user-friendly interface for viewing and downloading the builds. The application is split into a backend and a frontend, both written in JavaScript.

The backend is an Express server that handles data scraping, storage, and retrieval. It uses SQLite for data storage and AWS S3 for database file synchronization. The frontend is a React application that provides a user interface for viewing and downloading the builds.

## SQLite+S3

In the recent changes, the application's database has been switched from PostgreSQL to SQLite. The SQLite database file is stored in the backend's local file system and is synchronized with an S3 bucket. This change was made to simplify the application's architecture and deployment.

The SQLite database is managed by the sqlite3 library. The database file is named chromium_downloads.db and is located in the backend's root directory. The database schema is defined in backend/db.js and backend/s3.js.

The S3 integration is handled by the `@aws-sdk/client-s3` and `@aws-sdk/lib-storage` libraries. The S3 bucket name is set by the `S3_BUCKET_NAME` environment variable. The S3 integration can be skipped by setting the `SKIP_S3_INTEGRATION` environment variable to true. This is useful for local development when you don't want to connect to S3.

The database file is downloaded from S3 when the server starts and is uploaded to S3 when the server shuts down. This is handled in backend/index.js.

The database file is also ignored by Git to prevent it from being committed to the repository.

### Installing dependencies

```
yarn
```

### Running


To run the application, you need to install the dependencies with yarn and then start the server with yarn start. For local development, you can run the server without S3 integration by setting the SKIP_S3_INTEGRATION environment variable to true:

```shell
SKIP_S3_INTEGRATION=true yarn start
```

The application uses several environment variables to configure its behavior:

- `REACT_APP_API_URL`: This variable is used to set the API URL for the frontend. It is defined in frontend/src/index.js. If not set, it defaults to 'http://localhost:3001'.

- `PORT`: This variable is used to set the port on which the backend server listens. It is defined in backend/index.js. If not set, it defaults to 3001.

- `AWS_REGION`: This variable is used to set the AWS region for the S3 client. It is defined in backend/s3.js. If not set, it defaults to 'us-east-1'.

- `S3_BUCKET_NAME`: This variable is used to set the name of the S3 bucket where the database file is stored. It is defined in backend/s3.js. There is no default value, so it must be set.

- `SKIP_S3_INTEGRATION`: This variable is used to skip the integration with S3 for downloading and uploading the database file. It is defined in backend/s3.js and backend/index.js. If not set, it defaults to false.

Please note that the `SKIP_S3_INTEGRATION` environment variable is used in the yarn start command above to run the application without S3 integration. This is useful for local development when you don't want to connect to S3.


#### Running in Production

To run the application in a production environment, you need to set the following environment variables:

```shell
REACT_APP_API_URL=<your_api_url>
PORT=<your_port>
AWS_REGION=<your_aws_region>
S3_BUCKET_NAME=<your_s3_bucket_name>
```

Replace `<your_api_url>`, `<your_port>`, `<your_aws_region>`, and `<your_s3_bucket_name>` with your actual values.

Then, you can start the server with:

```shell
yarn start
```

Please note that in a production environment, you should not skip the S3 integration. The `SKIP_S3_INTEGRATION` environment variable should be left unset or set to false.

The application leverages the [default AWS profile search paths](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-authentication.html#cli-chap-authentication-precedence), so an IAM role, profile, hard-coded credentials, etc will be respected.

## Contributing

Contributions are welcome. Please make sure to follow the coding style and add tests for any new features or changes.