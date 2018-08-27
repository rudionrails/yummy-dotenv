const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const NODE_ENV = process.env.NODE_ENV || 'development';

const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);
const when = (condition, fn) => x => condition ? fn(x) : x;
const assign = x => y => Object.assign({}, x, y);

const only = from => object => Object.keys(object).reduce(
  (acc, key) => assign(acc)({ [key]: from[key] || acc[key] }),
  object,
);

const toArray = value => Array.isArray(value)
  ? value
  : String(value).trim().split(/\s*,\s*/);

const interpolate = defaults => object => {
  const capture = value => String(value || '').match(/\$\{(\w+)\}/g) || [];
  const substitute = value => variables => capture(value).reduce(
    (val, name) => val.replace(name, variables[name.slice(2, -1)] || ''),
    value,
  );

  return Object.entries(object).reduce(
    (acc, [key, value]) => assign(acc)({ [key]: pipe(assign(defaults), substitute(value))(acc) }),
    {},
  );
};

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
  const exists = file => file && pipe(resolve, fs.existsSync)(file);
  const parse = file => pipe(resolve, fs.readFileSync, dotenv.parse)(file);
  const read = file => when(exists(file), object => pipe(parse, assign(object))(file));

  const filter = file => object => {
    const keys = pipe(parse, Object.keys)(file);

    return keys.reduce(
      (acc, key) => assign(acc)({ [key]: object[key] }),
      {},
    );
  };

  return pipe(
    when(exists(defaults), read(defaults)),
    ...toArray(files).map(file => when(exists(file), read(file))),
    when(exists(schema), filter(schema)),
    when(system, only(process.env)),
    interpolate(system ? process.env : {}),
  )({});
}

module.exports = {
  parse: dotenv.parse,
  load: config,
  config,
};
