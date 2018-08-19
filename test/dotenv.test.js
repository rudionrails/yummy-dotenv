const path = require('path');
const test = require('ava');

// module under test
const dotenv = require('../src/index');

const options = {
  context: path.resolve(__dirname, 'fixtures'),
};

test.afterEach((t) => {
  delete process.env.FOO;
  delete process.env.BAR;
  delete process.env.BAZ;
  delete process.env.ABC;
  delete process.env.XYZ;
});

test('to read from the context dir', (t) => {
  const env = dotenv.config(options);

  t.deepEqual({
    FOO: 'foo-env',
    BAZ: 'baz-env-local',
    XYZ: undefined,
  }, env);
});

test('[options.defaults] to be ignored', (t) => {
  const env = dotenv.config({
    ...options,
    defaults: false,
  });

  t.deepEqual({
    FOO: 'foo-env',
    BAZ: 'baz-env-local',
    XYZ: undefined,
  }, env);
});

test('[options.system] to read system variables', (t) => {
  process.env.FOO = 'foo-process-env';
  process.env.ABC = 'abc-process-env'; // to be ignored
  process.env.XYZ = 'xyz-process-env';

  const env = dotenv.config(options);

  t.deepEqual({
    FOO: 'foo-process-env',
    BAZ: 'baz-env-local',
    XYZ: 'xyz-process-env',
  }, env);
});

test('[options.system] to ignore system variables', (t) => {
  const env = dotenv.config({
    ...options,
    system: false,
  });

  t.deepEqual({
    FOO: 'foo-env',
    BAZ: 'baz-env-local',
    XYZ: undefined,
  }, env);
});

test('[options.schema] to be ignored', (t) => {
  const env = dotenv.config({
    ...options,
    schema: false,
  });

  t.deepEqual({
    ABC: 'abc-env',
    FOO: 'foo-env',
    BAR: 'bar-defaults',
    BAZ: 'baz-env-local',
  }, env);
});

test('[options.files] to read correctly', (t) => {
  const env = dotenv.config({
    ...options,
    files: ['.env'],
  });

  t.deepEqual({
    FOO: 'foo-env',
    BAZ: undefined,
    XYZ: undefined,
  }, env);
});
