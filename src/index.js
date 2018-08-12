const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const NODE_ENV = process.env.NODE_ENV || 'development';

function config({
  context = path.resolve(process.cwd()),
  system = true,
  files = [
    '.env',
    '.env.local',
    `.env.${NODE_ENV}`,
    `.env.${NODE_ENV}.local`,
  ],
} = {}) {
  const exists = file => fs.existsSync(path.resolve(context, file));
  const parse = file => exists(file) ? dotenv.parse(fs.readFileSync(path.resolve(context, file))) : {};
  const mergeFile = (object, file) => Object.assign({}, object, parse(file));
  const onlyKeys = (object, file) => Object.keys(parse(file)).reduce(
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
    object => mergeFile(object, '.env.defaults'),

    // load the vars from the files
    //
    // if not specifically defined, the default is:
    //    .env
    //    .env.local
    //    .env.development
    //    .env.development.local
    object => files.reduce(mergeFile, object),

    // when configured (default: true), system vars take precedence
    //
    // unlike values taken form the .env.schema, those will be set
    // to '' (empty string) and not null.
    object => system ? Object.assign({}, object, process.env) : object,

    // when configured (default: true), reduce thea vars to the schema
    object => exists('.env.schema') ? onlyKeys(object, '.env.schema'): object,
  ].reduce((acc, fn) => fn(acc), {});
}

module.exports = {
  parse: dotenv.parse,
  load: config,
  config,
};
