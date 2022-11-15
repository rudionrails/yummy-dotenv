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

test.beforeEach(() => {
  process.env.DEF = "DEF-process-env";
});

test.afterEach(() => {
  delete process.env.DEF;
});

test("to substitute correctly when system vars are enabled", (t) => {
  const env = dotenv.config({
    ...options,
    system: true,
    files: ".env.variables",
  });

  t.deepEqual(env, {
    FOO: "foo-env",
    BAR: "foo-env@baz-env/DEF-process-env",
    BAZ: "baz-env",
    ABC: "$NOOP/",
  });
});

test("to substitute correctly when system vars are ddeepEqualabled", (t) => {
  const env = dotenv.config({
    ...options,
    system: false,
    files: ".env.variables",
  });

  t.deepEqual(env, {
    FOO: "foo-env",
    BAR: "foo-env@baz-env/",
    BAZ: "baz-env",
    ABC: "$NOOP/",
  });
});
