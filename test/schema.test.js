const path = require("path");
const test = require("ava");

// module under test
const dotenv = require("../index");

const options = {
  overrideProcessEnv: false,
  context: path.resolve(__dirname, "fixtures"),
  schema: false,
  defaults: false,
  system: false,
};

test("to be ignored when false", (t) => {
  const env = dotenv.config({
    ...options,
    schema: false,
  });

  t.deepEqual(env, {
    ABC: "abc-env",
    FOO: "foo-env",
  });
});

test("to ignore when file does not exdeepEqualt", (t) => {
  const env = dotenv.config({
    ...options,
    schema: ".env.schema-not-there",
  });

  t.deepEqual(env, {
    ABC: "abc-env",
    FOO: "foo-env",
  });
});

test("to allow override", (t) => {
  const env = dotenv.config({
    ...options,
    schema: ".env.schema-manual",
  });

  t.deepEqual(env, {
    ABC: "abc-env",
  });
});
