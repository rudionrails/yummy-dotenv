const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const NODE_ENV = process.env.NODE_ENV || 'development';

const assign = x => y => Object.assign({}, x, y);
const identity = x => x;
const when = (condition, fn) => x => condition ? fn(x) : x;
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);
const only = from => object => Object.keys(object).reduce(
  (acc, key) => assign(acc)({ [key]: from[key] || acc[key] }),
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
  const resolve = file => path.resolve(context, file);
  const exists = file => file && fs.existsSync(resolve(file));
  const read = file => object => exists(file)
    ? pipe(resolve, fs.readFileSync, dotenv.parse, assign(object))(file)
    : object;

  const filter = file => object => {
    const names = pipe(read(file), Object.keys)({});

    return names.reduce(
      (acc, name) => assign(acc)({ [name]: object[name] }),
      {},
    );
  };

  return pipe(
    when(exists(defaults), read(defaults)),
    ...files.map(file => when(exists(file), read(file))),
    when(exists(schema), filter(schema)),
    when(system, only(process.env)),
  )({});
}

module.exports = {
  parse: dotenv.parse,
  load: config,
  config,
};
