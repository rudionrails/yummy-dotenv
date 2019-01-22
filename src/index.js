const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const nodeEnv = () => process.env.NODE_ENV || "development";
const isDev = () => nodeEnv() === "development";

const pipe = /* #__PURE__ */ (...fns) => x =>
  fns.reduce((acc, fn) => fn(acc), x);
const when = /* #__PURE__ */ (conditionFn, fn) => x =>
  conditionFn(x) ? fn(x) : x;
const reduce = /* #__PURE__ */ (fn, x) => y => y.reduce(fn, x);
const assign = /* #__PURE__ */ x => y => Object.assign({}, x, y);

const only = /* #__PURE__ */ x => y =>
  Object.keys(y).reduce(
    (acc, key) => assign(acc)({ [key]: x[key] || acc[key] }),
    y,
  );

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
      assign(acc)({
        [key]: pipe(
          assign(defaults),
          substitute(value),
        )(acc),
      }),
    {},
  );
};

function config({
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
} = {}) {
  const resolve = file => path.resolve(context, file);
  const exists = file =>
    file &&
    pipe(
      resolve,
      fs.existsSync,
    )(file);
  const parse = file =>
    pipe(
      resolve,
      fs.readFileSync,
      dotenv.parse,
    )(file);
  const read = file =>
    when(
      () => exists(file),
      object =>
        pipe(
          parse,
          assign(object),
        )(file),
    );
  const readList = filesOrFn => object => {
    const files = typeof filesOrFn === "function" ? filesOrFn() : filesOrFn;

    return toArray(files)
      .filter(Boolean)
      .reduce((acc, file) => read(file)(acc), object);
  };

  const filter = file => object =>
    pipe(
      parse,
      Object.keys,
      reduce((acc, key) => assign(acc)({ [key]: object[key] }), {}),
    )(file);

  return pipe(
    when(() => exists(defaults), read(defaults)),
    readList(files),
    when(() => exists(schema), filter(schema)),
    when(() => system, only(process.env)),
    interpolate(system ? process.env : {}),
  )({});
}

module.exports = {
  parse: dotenv.parse,
  load: config,
  config,
};
