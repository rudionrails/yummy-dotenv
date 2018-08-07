const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const dotenv = require('dotenv');

const NODE_ENV = process.env.NODE_ENV || 'development';

function parse(context, file) {
  const filename = path.resolve(context, file);

  if (!fs.existsSync(filename)) return {};
  return dotenv.parse(fs.readFileSync(filename));
}

function config({
  context = path.resolve(process.cwd()),
  system = true,
  files: [
    '.env',
    `env.${NODE_ENV}`,
    `env.${NODE_ENV}.local`,
  ],
}) {
  const env = {};

  // load the .env.schema
  //
  // doing this, nullifies all the values
  Object.keys(parse(context, '.env.schema')).forEach((key) => {
    env[key] = null;
  });

  // load the .env.defaults
  //
  // all parsed keys will be assigned, e.g.
  //    FOO=bar
  //    # => { FOO: 'bar'
  //
  //    FOO=1
  //    # => { FOO: '1' }
  //
  //    FOO=
  //    # => { FOO: '' }
    Object.entries(parse(context, '.env.defaults')).forEach(([key, value]) => {
      env[key] = value;
    });

  // load the vars from the files
  //
  // if not specifically defined, the default is:
  //    .env
  //    .env.development
  //    .env.development.local
  files.map(file => Object.assign(env, parse(context, file)));

  // when configured, system vars take precedence
  if (system) {
    Object.keys(env).forEach((key) => {
      env[key] = process.env[key] || env[key];
    });
  }

  return env;
}

module.exports = {
  load: config,
  config,
  parse: dotenv.parse,
};
