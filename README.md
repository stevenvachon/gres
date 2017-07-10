# gres [![NPM Version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Dependency Monitor][greenkeeper-image]][greenkeeper-url]

> CLI scripts for bootstrapping a PostgreSQL database.

Getting team members set up with your app via lengthy, potentially outdated documentation can result in time-consuming questions. Shorten it all with simple automation.


## Installation

[Node.js](http://nodejs.org) `>= 6` and [PostgreSQL](https://postgresql.org) `>= 9` are required. To install, type this at the command line:
```shell
npm install gres
```


## API

A dual file convention is used, consisting of `.env.sample` and `.env`. Both file names and the paths to them can be customized.

`.env.sample` will be expected to contain a template of default values for environmental variables. This file should be committed to your project's repository. Here is an example of such a file containing the variable *names* that this library will look for:

```
POSTGRES_HOST=localhost
POSTGRES_NAME=myapp
POSTGRES_PASSWORD=myapp
POSTGRES_USER=myapp
```

`.env` will contain the real values specific to your development environment. **Be sure *not* to commit this file** as it of no use to anyone else and will only expose your sensitive information.

### `createdb(envPath=".env", envSamplePath=".env.sample")`

This function will:

* …read the contents of the file at `envSamplePath` if the file at `envPath` does not exist. Regardless of which is used, a series of confirmations will be prompted where you can overwrite these values for a new file to be written at `envPath`. Any other custom changes made to the existing file will be preserved.

* …create a database and database user using the variables within the file at `envPath`.

```js
const createdb = require('gres/createdb');

const run = async () => {
  try {
    await createdb();
  }
  catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
};

run();
```

### `dropdb(envPath=".env")`

This function will remove the database and database user described in the file at `envPath`.

```js
const dropdb = require('gres/dropdb');

const run = async () => {
  try {
    await dropdb();
  }
  catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
};

run();
```

[npm-image]: https://img.shields.io/npm/v/gres.svg
[npm-url]: https://npmjs.org/package/gres
[travis-image]: https://img.shields.io/travis/stevenvachon/gres.svg
[travis-url]: https://travis-ci.org/stevenvachon/gres
[coveralls-image]: https://img.shields.io/coveralls/stevenvachon/gres.svg
[coveralls-url]: https://coveralls.io/github/stevenvachon/gres
[greenkeeper-image]: https://badges.greenkeeper.io/stevenvachon/gres.svg
[greenkeeper-url]: https://greenkeeper.io/
