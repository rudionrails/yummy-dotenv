const dotenv = require("dotenv");
const {
  pipe,
  when,
  exists,
  read,
  readList,
  filter,
  only,
  interpolate,
} = require("./utils");

const nodeEnv = () => process.env.NODE_ENV || "development";
const isDev = () => nodeEnv() === "development";

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
