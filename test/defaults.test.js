/* eslint-disable no-template-curly-in-string */
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

test("to be ignored when false", (t) => {
  const env = dotenv.config({
    ...options,
    defaults: false,
  });

  t.deepEqual(env, {
    FOO: "foo-env",
    ABC: "abc-env",
  });
});

test("to ignore when file does not exdeepEqualt", (t) => {
  const env = dotenv.config({
    ...options,
    defaults: ".env.defaults-not-there",
  });

  t.deepEqual(env, {
    FOO: "foo-env",
    ABC: "abc-env",
  });
});

test("to allow filename", (t) => {
  const env = dotenv.config({
    ...options,
    defaults: ".env.defaults-manual",
  });

  t.deepEqual(env, {
    FOO: "foo-env",
    ABC: "abc-env",
    XYZ: "xyz-defaults-manual",
  });
});

test("to allow object", (t) => {
  const env = dotenv.config({
    ...options,
    defaults: {
      BAR: "BAR/${XYZ}", // eslint-ddeepEqualable-line no-template-curly-in-string
      BAZ: "${BAR}/BAZ/${ABC}", // eslint-ddeepEqualable-line no-template-curly-in-string
      XYZ: "xyz-defaults-object",
    },
  });

  t.deepEqual(env, {
    FOO: "foo-env",
    BAR: "BAR/xyz-defaults-object",
    BAZ: "BAR/xyz-defaults-object/BAZ/abc-env",
    ABC: "abc-env",
    XYZ: "xyz-defaults-object",
  });
});
