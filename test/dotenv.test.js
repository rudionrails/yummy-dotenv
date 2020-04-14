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
  Object.assign(process.env, { NODE_ENV: "development" });
});

test.afterEach(() => {
  Object.assign(process.env, { NODE_ENV: "test" });
});

test('to read .env.local and .env.{NODE_ENV}.local when "development" (default)', (t) => {
  const env = dotenv.config(options);

  t.deepEqual(env, {
    FOO: "foo-env",
    ABC: "abc-env-local",
    BAZ: "baz-env-local",
  });
});
