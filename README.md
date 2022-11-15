# A yummy dotenv library

An opinionated .env parsing library. Key features:

- read .env-files based on `NODE_ENV`, e.g. .env, .env.local, .env.development
- pass custom default values for your variables
- allow / prevent variable inclusion from `proces.env`
- use `.env.schema` to only allow certain values
- parameter expansion / interpolation of env-variables, e.g. `GREET="Hello ${NAME}`

## Installation

```shell
# npm
npm i @yummy/dotenv

# OR yarn
yarn add @yummy/dotenv
```

## Usage

This library makes some assumptions based on available `.env`-files. Unless configured otherwise, the following load order applies as follows:

- `.env.defaults`
- `.env`
- `.env.local`
- `.env.${NODE_ENV}`
- `.env.${NODE_ENV}.local`
- `.env.schema`
- `process.env`

The default options used are as follows:

```javascript
// for ES6, use `import dotenv from "@yummy/dotenv";`
const dotenv = require("@yummy/dotenv");

const env = dotenv.config({
  // replaces process.env with what is parsed by this library. Set it to true
  // if you want to opt into this.
  override = false

  // the directory to read the .env-files from
  context = path.resolve(process.cwd()),

  // allow system variables to take precedence
  system = true,

  // limit variables to keys specified in here
  schema = '.env.schema',

  // some default values for any environment, good for bootstrapping
  defaults = '.env.defaults',

  // the files to read (in that order)
  files = [
    '.env',
    '.env.local',
    `.env.${NODE_ENV}`,
    `.env.${NODE_ENV}.local`,
  ],
});
```

### .env.defaults

Use this to provide your dotenv config with some default values. Values defined in later files or `process.env` will override those. If your project does not have this file, then it will be ignored. You can also configure it to disable it explicitly or point it to another defaults file. Alternatively, you may pass an object to defaults.

```javascript
// the default value
const env = dotenv.config({ defaults: ".env.defaults" });

// point to a different file
const env = dotenv.config({ defaults: "/<path>/<to>/.env.defaults" });

// disable it explicitly
const env = dotenv.config({ defaults: false });

// pass as object, which will NOT attempt to read from file
const env = dotenv.config({
  defaults: { FOO: "default FOO value" },
});
```

The behaviour is as follows:

```javascript
// $ cat .env.defaults
// FOO='default foo'
// BAR='default bar'
//
// $ cat .env
// FOO='foo from .env'

const env = dotenv.config();
// => { FOO: 'foo from .env', BAR: 'default bar' }
```

### .env.schema

You may wish to limit your dotenv variables to specific keys only. This is useful if you want to guard your application from an unexpected environment configuration.

```javascript
// the default value
const env = dotenv.config({ schema: ".env.schema" });

// point to a different file
const env = dotenv.config({ schema: "/<path>/<to>/.env.schema" });

// disable it explicitly
const env = dotenv.config({ schema: false });
```

The behaviour is as follows:

```javascript
// $ cat .env.schema
// FOO=
//
// $ cat .env
// FOO='foo from .env'
// BAR='bar from .env'

const env = dotenv.config();
// => { FOO: 'foo from .env'
```

### process.env (system variables)

By default, system variables will be read. They take precedence over and are limited to variables defined in the `.env`-files. `.env.defaults` and `.env.schema` behavour still applies. You can disable this explicitly, of course.

```javascript
const env = dotenv.config({ system: true });

// disable it
const env = dotenv.config({ system: false });
```

The behaviour is as follows:

```javascript
// $ cat .env
// FOO='foo from .env'
// BAR='bar from .env'
//
// $ env
// FOO='foo from system env'
// BAZ='baz from system env' // will be ignored

const env = dotenv.config();
// => { FOO: 'foo from system  env', BAR: 'bar from .env' }
```

### the .env file list

You can also configure the list of `.env`-files to read. The order of which also determines the read order when parsing those files. In case you pass files that do not exist, they will be ignored. `.env.defaults` and `.env.schema` behavour still applies.

```javascript
// $ cat .env
// FOO='foo from .env'
//
// $ .env.custom
// FOO='foo from custom env'

const env = dotenv.config({ files: [".env", ".env.custom"] });
// => { FOO: 'foo from custom env' }
```
