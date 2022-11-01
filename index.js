const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const nodeEnv = () => process.env.NODE_ENV || "development";
const isDev = () => nodeEnv() === "development";

const isString = (x) => x && x.constructor === String;
const isObject = (x) => x && x.constructor === Object;
const when = (conditionFn, fn) => (x) => conditionFn(x) ? fn(x) : x;
const mergeRight = (x, y) => ({ ...x, ...y });

const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((acc, fn) => fn(acc), x);

const toArray = (x) =>
  Array.isArray(x)
    ? x
    : String(x)
        .trim()
        .split(/\s*,\s*/);

const only = (x, y) =>
  Object.keys(y).reduce(
    (acc, key) => mergeRight(acc, { [key]: x[key] || acc[key] }),
    y,
  );

const exists = (context, file) => fs.existsSync(path.resolve(context, file));
function parse(context, file) {
  const contents = fs.readFileSync(path.resolve(context, file));
  return dotenv.parse(contents);
}

const read = (context, file, object) =>
  exists(context, file) ? mergeRight(object, parse(context, file)) : object;

const readList = (context, filesOrFn, object) => {
  const files = typeof filesOrFn === "function" ? filesOrFn() : filesOrFn;

  return toArray(files)
    .filter(Boolean)
    .reduce((acc, file) => read(context, file, acc), object);
};

function filter(context, file, object) {
  const content = parse(context, file);

  return Object.keys(content).reduce(
    (acc, key) => mergeRight(acc, { [key]: object[key] }),
    {},
  );
}

function interpolate(defaults, object) {
  const capture = (value) => String(value || "").match(/\$\{(\w+)\}/g) || [];
  const substitute = (value, variables) => {
    const reducer = (val, key) =>
      val.replace(key, variables[key.slice(2, -1)] || "");

    return capture(value).reduce(reducer, value);
  };

  return Object.entries(object).reduce(
    (acc, [key, value]) =>
      mergeRight(acc, {
        [key]: pipe(
          (o) => mergeRight(defaults, o),
          (o) => substitute(value, o),
        )(acc),
      }),
    object,
  );
}

function config(options = {}) {
  const {
    overrideProcessEnv = true,
    context = process.cwd(),
    defaults = ".env.defaults",
    schema = ".env.schema",
    system = true,
    files = () =>
      [
        ".env",
        isDev() && ".env.local",
        `.env.${nodeEnv()}`,
        isDev() && `.env.${nodeEnv()}.local`,
      ].filter(Boolean),
  } = options;

  const env = pipe(
    // read the defaults or use the passed Object
    when(
      () => isString(defaults) && exists(context, defaults),
      (object) => read(context, defaults, object),
    ),
    when(
      () => isObject(defaults),
      () => defaults,
    ),
    // the content of the regular files
    (object) => readList(context, files, object),
    // reduce the key-value pairs down to what is defined in the schema
    when(
      () => isString(schema) && exists(context, schema),
      (object) => filter(context, schema, object),
    ),
    // allow system variables to take precedence
    when(
      () => system,
      (object) => only(process.env, object),
    ),
    // simple parameter expansion / interpolation
    (object) => interpolate(system ? process.env : {}, object),
  )({});

  if (overrideProcessEnv) {
    Object.assign(process, { env });
  }

  return env;
}

module.exports = {
  parse: dotenv.parse,
  load: config,
  config,
};
