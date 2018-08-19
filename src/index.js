const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const NODE_ENV = process.env.NODE_ENV || 'development';

const pipe = (...list) => object => list.reduce((acc, fn) => fn(acc), object);
const map = (list, fn) => list.map(fn);
const when = (predicate, fn) => object => predicate ? fn(object) : object;
const keys = env => Object.keys(env);

const assign = env => object => Object.assign({}, object, env);
const only = env => object => Object.keys(object).reduce(
  (acc, key) => assign({ [key]: env[key] || acc[key] })(acc),
  object,
);

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
  const parse = file => object => {
    const filename = path.resolve(context, file);
    const env = fs.existsSync(filename)
      ? dotenv.parse(fs.readFileSync(path.resolve(context, file)))
      : {};

    return assign(env)(object);
  };
  const pick = file => object => Object.keys(parse(file)({})).reduce(
    (acc, key) => assign({ [key]: object[key] })(acc),
    {},
  );

  return pipe(
    when(defaults, parse(defaults)),
    pipe(...map(files, parse)),
    when(schema, pick(schema)),
    when(system, only(process.env)),
  )({});
}

module.exports = {
  parse: dotenv.parse,
  load: config,
  config,
};
