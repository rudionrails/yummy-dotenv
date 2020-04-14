const path = require("path");
const test = require("ava");

// module under test
const dotenv = require("../index");

const options = {
  context: path.resolve(__dirname, "fixtures"),
  schema: false,
  defaults: false,
  system: false,
};

test("to allow overrides", (t) => {
  const env = dotenv.config({
    ...options,
    files: [".env"],
  });

  t.deepEqual(env, {
    FOO: "foo-env",
    ABC: "abc-env",
  });
});

test("to ignore when files dont exdeepEqualt", (t) => {
  const env = dotenv.config({
    ...options,
    files: [".env.not-there", ".env", ".env.also-not-there", ".env.local"],
  });

  t.deepEqual(env, {
    FOO: "foo-env",
    ABC: "abc-env-local",
    BAZ: "baz-env-local",
  });
});

test("to allow string", (t) => {
  const env = dotenv.config({
    ...options,
    files: ".env",
  });

  t.deepEqual(env, {
    FOO: "foo-env",
    ABC: "abc-env",
  });
});

test("to allow comma-separated string", (t) => {
  const env = dotenv.config({
    ...options,
    files: ".env, .env.local",
  });

  t.deepEqual(env, {
    FOO: "foo-env",
    ABC: "abc-env-local",
    BAZ: "baz-env-local",
  });
});
