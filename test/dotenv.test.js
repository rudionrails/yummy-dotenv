const path = require("path");

// module under test
const dotenv = require("../src/index");

const { NODE_ENV } = process.env;
const options = {
  context: path.resolve(__dirname, "fixtures"),
};

afterEach(() => {
  Object.assign(process.env, { NODE_ENV });
});

test("to read from the context dir", () => {
  const env = dotenv.config(options);

  expect(env).toEqual({
    FOO: "foo-env",
    BAZ: undefined,
    XYZ: undefined,
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
      BAZ: undefined,
      XYZ: undefined,
    });
  });

  test("to ignore when file does not exist", () => {
    const env = dotenv.config({
      ...options,
      defaults: ".env.defaults-not-there",
    });

    expect(env).toEqual({
      FOO: "foo-env",
      BAZ: undefined,
      XYZ: undefined,
    });
  });

  test("to allow override", () => {
    const env = dotenv.config({
      ...options,
      defaults: ".env.defaults-manual",
    });

    expect(env).toEqual({
      FOO: "foo-env",
      BAZ: undefined,
      XYZ: "xyz-defaults-manual",
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
    process.env.ABC = "abc-process-env"; // to be ignored
    process.env.XYZ = "xyz-process-env";

    const env = dotenv.config(options);

    expect(env).toEqual({
      FOO: "foo-process-env",
      BAZ: undefined,
      XYZ: "xyz-process-env",
    });
  });

  test("to be ignored when false", () => {
    const env = dotenv.config({
      ...options,
      system: false,
    });

    expect(env).toEqual({
      FOO: "foo-env",
      BAZ: undefined,
      XYZ: undefined,
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
      BAR: "bar-defaults",
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
      BAR: "bar-defaults",
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
      BAZ: undefined,
      XYZ: undefined,
    });
  });

  test("to ignore when files dont exist", () => {
    const env = dotenv.config({
      ...options,
      files: [".env.not-there", ".env", ".env.also-not-there", ".env.local"],
    });

    expect(env).toEqual({
      FOO: "foo-env",
      BAZ: "baz-env-local",
      XYZ: undefined,
    });
  });

  test("to allow string", () => {
    const env = dotenv.config({
      ...options,
      files: ".env",
    });

    expect(env).toEqual({
      FOO: "foo-env",
      BAZ: undefined,
      XYZ: undefined,
    });
  });

  test("to allow comma-separated string", () => {
    const env = dotenv.config({
      ...options,
      files: ".env, .env.local",
    });

    expect(env).toEqual({
      FOO: "foo-env",
      BAZ: "baz-env-local",
      XYZ: undefined,
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
      BAZ: "baz-env-local",
      XYZ: undefined,
    });
  });
});

describe("variable substitution", () => {
  beforeEach(() => {
    process.env.XYZ = "XYZ-process-env";
  });

  afterEach(() => {
    delete process.env.XYZ;
  });

  test("to substitute correctly when system vars are enabled", () => {
    const env = dotenv.config({
      ...options,
      defaults: false,
      schema: false,
      files: ".env.variables",
    });

    expect(env).toEqual({
      FOO: "foo-env",
      BAR: "foo-env@/XYZ-process-env",
      BAZ: "baz-env",
      ABC: "$NOOP/",
    });
  });

  test("to substitute correctly when system vars are disabled", () => {
    const env = dotenv.config({
      ...options,
      defaults: false,
      schema: false,
      system: false,
      files: ".env.variables",
    });

    expect(env).toEqual({
      FOO: "foo-env",
      BAR: "foo-env@/",
      BAZ: "baz-env",
      ABC: "$NOOP/",
    });
  });
});
