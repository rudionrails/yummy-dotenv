const path = require("path");
const test = require("ava");

// module under test
const dotenv = require("../index");

const originalProcessEnv = process.env;
const options = {
  context: path.resolve(__dirname, "fixtures"),
  schema: false,
  defaults: false,
  system: false,
};

test.afterEach(() => {
  process.env = originalProcessEnv;
});

test('to read .env.local and .env.{NODE_ENV}.local when "development" (default)', (t) => {
  process.env.NODE_ENV = "development";

  const env = dotenv.config(options);

  t.deepEqual(env, {
    FOO: "foo-env",
    ABC: "abc-env-local",
    BAZ: "baz-env-local",
  });
});

test("to not override process.env by default", (t) => {
  dotenv.config(options);

  t.deepEqual(process.env, originalProcessEnv);
});

test("to override process.env when `override: true` is provided", (t) => {
  dotenv.config({ ...options, override: true });

  t.deepEqual(process.env, {
    ABC: "abc-env-local",
    BAZ: "baz-env-local",
    FOO: "foo-env",
  });
});
