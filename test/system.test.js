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

test.afterEach(() => {
  delete process.env.FOO;
  delete process.env.ABC;
  delete process.env.XYZ;
});

test("to read system variables", (t) => {
  process.env.FOO = "foo-process-env";
  process.env.ABC = "abc-process-env";
  process.env.XYZ = "xyz-process-env"; // to be ignored

  const env = dotenv.config({ ...options, system: true });

  t.deepEqual(env, {
    FOO: "foo-process-env",
    ABC: "abc-process-env",
  });
});

test("to be ignored when false", (t) => {
  process.env.ABC = "abc-process-env"; // to be ignored

  const env = dotenv.config({
    ...options,
    system: false,
  });

  t.deepEqual(env, {
    FOO: "foo-env",
    ABC: "abc-env",
  });
});
