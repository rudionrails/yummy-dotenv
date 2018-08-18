const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const NODE_ENV = process.env.NODE_ENV || 'development';

function config({
  context = path.resolve(process.cwd()),
  system = true,
  schema = '.env.schema',
  defaults = '.env.defaults',
  files = [
    '.env',
    '.env.local',
    `.env.${NODE_ENV}`,
    `.env.${NODE_ENV}.local`,
  ],
} = {}) {
  const exists = file => fs.existsSync(path.resolve(context, file));
  const parse = file => exists(file) ? dotenv.parse(fs.readFileSync(path.resolve(context, file))) : {};
  const read = (object, file) => Object.assign({}, object, parse(file));
  const map = (object, files) => files.reduce(read, object);
  const only = (object, env) => Object.keys(object).reduce(
    (acc, key) => Object.assign({}, acc, { [key]: env[key] || acc[key] }),
    object,
  );
  const pick = (object, env) => Object.keys(env).reduce(
    (acc, key) => Object.assign({}, acc, { [key]: object[key] }),
    {},
  );

  return [
    // load the .env.defaults
    //
    // all parsed keys will be assigned, e.g.
    //    FOO=bar
    //    # => { FOO: 'bar' }
    //
    //    FOO=1
    //    # => { FOO: '1' }
    //
    //    FOO=
    //    # => { FOO: '' }
    object => defaults ? read(object, defaults) : object,

    // load the vars from the files
    //
    // if not specifically defined, the default is:
    //    .env
    //    .env.local
    //    .env.development
    //    .env.development.local
    object => map(object, files),

    // // when schema is set (default: true), reduce the vars to it
    object => schema ? pick(object, parse(schema)): object,

    // when system var are allowed (default: true), they take precedence
    //
    // unlike values taken form the .env.schema, those will be set
    // to '' (empty string) and not null.
    object => system ? only(object, process.env) : object,
  ].reduce((acc, fn) => fn(acc), {});
}

module.exports = {
  parse: dotenv.parse,
  load: config,
  config,
};
