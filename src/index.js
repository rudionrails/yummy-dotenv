const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const NODE_ENV = process.env.NODE_ENV || 'development';

function config({
  context = path.resolve(process.cwd()),
  defaults = '.env.defaults',
  schema = '.env.schema',
  system = true,
  files = [
    '.env',
    '.env.local',
    `.env.${NODE_ENV}`,
    `.env.${NODE_ENV}.local`,
  ],
} = {}) {
  const parse = file => fs.existsSync(path.resolve(context, file))
    ? dotenv.parse(fs.readFileSync(path.resolve(context, file)))
    : {};

  const pick = file => object => Object.keys(parse(file)).reduce(
    (acc, key) => Object.assign({}, acc, { [key]: object[key] }),
    {},
  );

  const only = env => object => Object.keys(object).reduce(
    (acc, key) => Object.assign({}, acc, { [key]: env[key] || acc[key] }),
    object,
  );

  const pipe = (...list) => object => list.reduce((acc, fn) => fn(acc), object);
  const when = (predicate, fn) => object => predicate ? fn(object) : object;
  const assign = file => object => Object.assign({}, object, parse(file));
  const map = files => object => files.reduce((acc, file) => assign(file)(acc), object);

  return pipe(
    when(defaults, assign(defaults)),
    map(files),
    when(schema, pick(schema)),
    when(system, only(process.env)),
  )({});
}

module.exports = {
  parse: dotenv.parse,
  load: config,
  config,
};
