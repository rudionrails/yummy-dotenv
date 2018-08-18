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

  t.deepEqual(env, {
    FOO: 'foo-env',
    BAZ: 'baz-env-local',
    XYZ: undefined,
  });
});

test('[options.defaults] to be ignored', (t) => {
  const env = dotenv.config({
    ...options,
    defaults: false,
  });

  t.deepEqual(env, {
    FOO: 'foo-env',
    BAZ: 'baz-env-local',
    XYZ: undefined,
  });
});

test('[options.system] to read system variables', (t) => {
  process.env.FOO = 'foo-process-env';
  process.env.ABC = 'abc-process-env'; // to be ignored
  process.env.XYZ = 'xyz-process-env';

  const env = dotenv.config(options);

  t.deepEqual(env, {
    FOO: 'foo-process-env',
    BAZ: 'baz-env-local',
    XYZ: 'xyz-process-env',
  });
});

test('[options.system] to ignore system variables', (t) => {
  const env = dotenv.config({
    ...options,
    system: false,
  });

  t.deepEqual(env, {
    FOO: 'foo-env',
    BAZ: 'baz-env-local',
    XYZ: undefined,
  });
});

test('[options.schema] to be ignored', (t) => {
  const env = dotenv.config({
    ...options,
    schema: false,
  });

  t.deepEqual(env, {
    ABC: 'abc-env',
    FOO: 'foo-env',
    BAR: 'bar-defaults',
    BAZ: 'baz-env-local',
  });
});
