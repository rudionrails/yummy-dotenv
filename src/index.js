const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const nodeEnv = () => process.env.NODE_ENV || "development";
const isDev = () => nodeEnv() === "development";

const pipe = /* #__PURE__ */ (...fns) => x =>
  fns.reduce((acc, fn) => fn(acc), x);
const when = /* #__PURE__ */ (conditionFn, fn) => x =>
  conditionFn(x) ? fn(x) : x;
const mergeRight = /* #__PURE__ */ x => y => Object.assign({}, x, y);
const reduce = /* #__PURE__ */ (fn, x) => y => y.reduce(fn, x);

const only = /* #__PURE__ */ x => y => {
  const reducer = (acc, key) => mergeRight(acc)({ [key]: x[key] || acc[key] });

  return pipe(
    Object.keys,
    reduce(reducer, y),
  )(y);
};

const toArray = /* #__PURE__ */ x =>
  Array.isArray(x)
    ? x
    : String(x)
        .trim()
        .split(/\s*,\s*/);

const interpolate = /* #__PURE__ */ defaults => object => {
  const capture = value => String(value || "").match(/\$\{(\w+)\}/g) || [];
  const substitute = value => variables => {
    const reducer = (val, key) =>
      val.replace(key, variables[key.slice(2, -1)] || "");

    return pipe(
      capture,
      reduce(reducer, value),
    )(value);
  };

  return Object.entries(object).reduce(
    (acc, [key, value]) =>
      mergeRight(acc)({
        [key]: pipe(
          mergeRight(defaults),
          substitute(value),
        )(acc),
      }),
    {},
  );
};

const exists = (context, file) =>
  file && fs.existsSync(path.resolve(context, file));

const parse = (context, file) =>
  pipe(
    f => path.resolve(context, f),
    fs.readFileSync,
    dotenv.parse,
  )(file);

const read = (context, file) => object =>
  when(
    () => exists(context, file),
    obj => mergeRight(obj)(parse(context, file)),
  )(object);

const readList = (context, filesOrFn) => object => {
  const files = typeof filesOrFn === "function" ? filesOrFn() : filesOrFn;

  return toArray(files)
    .filter(Boolean)
    .reduce((acc, file) => read(context, file)(acc), object);
};

const filter = (context, file) => object => {
  const content = parse(context, file);

  return Object.keys(content).reduce(
    (acc, key) => mergeRight(acc)({ [key]: object[key] }),
    {},
  );
};

const config = ({
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
} = {}) =>
  pipe(
    // read the defaults
    when(() => exists(context, defaults), read(context, defaults)),
    // the content of the regular files
    readList(context, files),
    // reduce the key-value pairs down to what is efined in the schema
    when(() => exists(context, schema), filter(context, schema)),
    // allow system variables to take precedence
    when(() => system, only(process.env)),
    // simple parameter expansion / interpolation
    interpolate(system ? process.env : {}),
  )({});

module.exports = {
  parse: dotenv.parse,
  load: config,
  config,
};
