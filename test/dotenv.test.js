const path = require("path");

// module under test
const dotenv = require("../index");

const { NODE_ENV } = process.env;
const options = {
  context: path.resolve(__dirname, "fixtures"),
  schema: false,
  defaults: false,
  system: false,
};

afterEach(() => {
  Object.assign(process.env, { NODE_ENV });
});

test("to read from the context dir", () => {
  const env = dotenv.config(options);

  expect(env).toEqual({
    FOO: "foo-env",
    ABC: "abc-env",
  });
});

describe("options.defaults", () => {
  test("to be ignored when false", () => {
    const env = dotenv.config({
      ...options,
      defaults: false,
    });

    expect(env).toEqual({
      FOO: "foo-env",
      ABC: "abc-env",
    });
  });

  test("to ignore when file does not exist", () => {
    const env = dotenv.config({
      ...options,
      defaults: ".env.defaults-not-there",
    });

    expect(env).toEqual({
      FOO: "foo-env",
      ABC: "abc-env",
    });
  });

  test("to allow filename", () => {
    const env = dotenv.config({
      ...options,
      defaults: ".env.defaults-manual",
    });

    expect(env).toEqual({
      FOO: "foo-env",
      ABC: "abc-env",
      XYZ: "xyz-defaults-manual",
    });
  });

  test("to allow object", () => {
    const env = dotenv.config({
      ...options,
      defaults: {
        BAR: "BAR/${XYZ}", // eslint-disable-line no-template-curly-in-string
        BAZ: "${BAR}/BAZ/${ABC}", // eslint-disable-line no-template-curly-in-string
        XYZ: "xyz-defaults-object",
      },
    });

    expect(env).toEqual({
      FOO: "foo-env",
      BAR: "BAR/xyz-defaults-object",
      BAZ: "BAR/xyz-defaults-object/BAZ/abc-env",
      ABC: "abc-env",
      XYZ: "xyz-defaults-object",
    });
  });
});

describe("options.systen", () => {
  afterEach(() => {
    delete process.env.FOO;
    delete process.env.ABC;
    delete process.env.XYZ;
  });

  test("to read system variables", () => {
    process.env.FOO = "foo-process-env";
    process.env.ABC = "abc-process-env";
    process.env.XYZ = "xyz-process-env"; // to be ignored

    const env = dotenv.config({ ...options, system: true });

    expect(env).toEqual({
      FOO: "foo-process-env",
      ABC: "abc-process-env",
    });
  });

  test("to be ignored when false", () => {
    process.env.ABC = "abc-process-env"; // to be ignored

    const env = dotenv.config({
      ...options,
      system: false,
    });

    expect(env).toEqual({
      FOO: "foo-env",
      ABC: "abc-env",
    });
  });
});

describe("options.schema", () => {
  test("to be ignored when false", () => {
    const env = dotenv.config({
      ...options,
      schema: false,
    });

    expect(env).toEqual({
      ABC: "abc-env",
      FOO: "foo-env",
    });
  });

  test("to ignore when file does not exist", () => {
    const env = dotenv.config({
      ...options,
      schema: ".env.schema-not-there",
    });

    expect(env).toEqual({
      ABC: "abc-env",
      FOO: "foo-env",
    });
  });

  test("to allow override", () => {
    const env = dotenv.config({
      ...options,
      schema: ".env.schema-manual",
    });

    expect(env).toEqual({
      ABC: "abc-env",
    });
  });
});

describe("options.files", () => {
  test("to allow overrides", () => {
    const env = dotenv.config({
      ...options,
      files: [".env"],
    });

    expect(env).toEqual({
      FOO: "foo-env",
      ABC: "abc-env",
    });
  });

  test("to ignore when files dont exist", () => {
    const env = dotenv.config({
      ...options,
      files: [".env.not-there", ".env", ".env.also-not-there", ".env.local"],
    });

    expect(env).toEqual({
      FOO: "foo-env",
      ABC: "abc-env-local",
      BAZ: "baz-env-local",
    });
  });

  test("to allow string", () => {
    const env = dotenv.config({
      ...options,
      files: ".env",
    });

    expect(env).toEqual({
      FOO: "foo-env",
      ABC: "abc-env",
    });
  });

  test("to allow comma-separated string", () => {
    const env = dotenv.config({
      ...options,
      files: ".env, .env.local",
    });

    expect(env).toEqual({
      FOO: "foo-env",
      ABC: "abc-env-local",
      BAZ: "baz-env-local",
    });
  });
});

describe('when NODE_ENV === "development"', () => {
  beforeEach(() => {
    Object.assign(process.env, { NODE_ENV: "development" });
  });

  test('to read .env.local and .env.{NODE_ENV}.local when "development" (default)', () => {
    const env = dotenv.config(options);

    expect(env).toEqual({
      FOO: "foo-env",
      ABC: "abc-env-local",
      BAZ: "baz-env-local",
    });
  });
});

describe("variable substitution / interpolation", () => {
  beforeEach(() => {
    process.env.DEF = "DEF-process-env";
  });

  afterEach(() => {
    delete process.env.DEF;
  });

  test("to substitute correctly when system vars are enabled", () => {
    const env = dotenv.config({
      ...options,
      system: true,
      files: ".env.variables",
    });

    expect(env).toEqual({
      FOO: "foo-env",
      BAR: "foo-env@baz-env/DEF-process-env",
      BAZ: "baz-env",
      ABC: "$NOOP/",
    });
  });

  test("to substitute correctly when system vars are disabled", () => {
    const env = dotenv.config({
      ...options,
      system: false,
      files: ".env.variables",
    });

    expect(env).toEqual({
      FOO: "foo-env",
      BAR: "foo-env@baz-env/",
      BAZ: "baz-env",
      ABC: "$NOOP/",
    });
  });
});
