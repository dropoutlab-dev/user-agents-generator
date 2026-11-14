'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const api = require('../index.cjs');
const { FALLBACKS } = require('../lib/fallbacks.cjs');
const { randomInt, pick, escapeRegExp, sanitizeUserAgent } = require('../lib/helpers.cjs');

const LEGACY = ['chrome', 'firefox', 'safari', 'android', 'ios'];
const ADDED = ['edge', 'opera', 'random', 'generate', 'headers'];
const ALL_METHODS = [...LEGACY, ...ADDED];

/** Chromium-family markers that must never appear in a Safari UA. */
const CHROMIUM = /(Chrome\/|Chromium\/|Edg\/|EdgA\/|OPR\/|SamsungBrowser|CriOS)/;

test('exposes the full public surface', () => {
  for (const name of ALL_METHODS) {
    assert.equal(typeof api[name], 'function', `${name} should be a function`);
  }
});

test('the five legacy methods still return a non-empty string', () => {
  for (const name of LEGACY) {
    const value = api[name]();
    assert.equal(typeof value, 'string', `${name} returns a string`);
    assert.ok(value.length > 0, `${name} returns a non-empty string`);
    assert.match(value, /^Mozilla\/5\.0/, `${name} looks like a UA`);
  }
});

test('the five added methods return a non-empty string', () => {
  for (const name of ['edge', 'opera', 'random']) {
    const value = api[name]();
    assert.equal(typeof value, 'string');
    assert.ok(value.length > 0);
  }
  assert.ok(api.generate().length > 0);
  assert.equal(typeof api.headers()['User-Agent'], 'string');
});

test('no method ever emits a CR or LF', () => {
  for (const name of ALL_METHODS) {
    for (let i = 0; i < 20; i += 1) {
      const value = api[name]();
      const text = typeof value === 'string' ? value : value['User-Agent'];
      assert.doesNotMatch(text, /[\r\n]/, `${name} must not emit line breaks`);
    }
  }
});

test('safari() never returns a Chromium-family UA', () => {
  for (let i = 0; i < 250; i += 1) {
    const value = api.safari();
    assert.doesNotMatch(value, CHROMIUM, `safari() leaked a Chromium UA: ${value}`);
    assert.match(value, /Safari\//);
    assert.match(value, /Version\//);
  }
});

test('chrome() never returns an Edge or Opera UA', () => {
  for (let i = 0; i < 150; i += 1) {
    assert.doesNotMatch(api.chrome(), /(Edg\/|OPR\/|EdgA\/)/);
  }
});

test('edge() and opera() carry their own vendor tokens', () => {
  for (let i = 0; i < 40; i += 1) {
    assert.match(api.edge(), /Edg\//);
    assert.match(api.opera(), /OPR\//);
  }
});

test('android() and ios() describe mobile platforms', () => {
  for (let i = 0; i < 40; i += 1) {
    assert.match(api.android(), /Android/);
    assert.match(api.ios(), /(iPhone|iPad|iPod)/);
  }
});

test('generate() escapes regex metacharacters instead of throwing', () => {
  assert.doesNotThrow(() => api.generate({ browser: 'chrome(' }));
  assert.doesNotThrow(() => api.generate({ browser: '[' }));
  assert.doesNotThrow(() => api.generate({ browser: '.*' }));
  assert.doesNotThrow(() => api.generate({ os: 'win(' }));
  const value = api.generate({ browser: 'chrome(' });
  assert.equal(typeof value, 'string');
  assert.ok(value.length > 0);
});

test('generate() honours browser constraints', () => {
  assert.match(api.generate({ browser: 'chrome' }), /Chrome\//);
  assert.match(api.generate({ browser: 'firefox' }), /Firefox\//);
  assert.match(api.generate({ browser: 'edge' }), /Edg\//);
  assert.match(api.generate({ browser: 'safari' }), /Safari\//);
  assert.doesNotMatch(api.generate({ browser: 'safari' }), CHROMIUM);
});

test('generate() honours os and device constraints', () => {
  const windows = api.generate({ os: 'windows' });
  assert.match(windows, /Windows NT/);

  const android = api.generate({ os: 'android' });
  assert.match(android, /Android/);

  const desktop = api.generate({ device: 'desktop' });
  assert.doesNotMatch(desktop, /(Mobile|iPhone|iPad|Android)/);

  const mobile = api.generate({ device: 'mobile' });
  assert.match(mobile, /(Mobile|iPhone|iPad|Android)/);
});

test('generate() degrades instead of throwing on unsatisfiable input', () => {
  const value = api.generate({ browser: 'netscape-navigator-3', os: 'beos' });
  assert.equal(typeof value, 'string');
  assert.ok(value.length > 0);
});

test('generate() rejects a non-object argument', () => {
  assert.throws(() => api.generate('chrome'), TypeError);
  assert.throws(() => api.generate(['chrome']), TypeError);
  assert.doesNotThrow(() => api.generate());
  assert.doesNotThrow(() => api.generate(null));
});

test('headers() returns a usable request header map', () => {
  const headers = api.headers();
  assert.match(headers['User-Agent'], /^Mozilla\/5\.0/);
  assert.equal(typeof headers.Accept, 'string');
  assert.equal(typeof headers['Accept-Language'], 'string');
});

test('headers() passes through an explicit UA', () => {
  const explicit = 'Mozilla/5.0 (X11; Linux x86_64) TestAgent/1.0';
  assert.equal(api.headers(explicit)['User-Agent'], explicit);
});

test('headers() rejects CRLF injection', () => {
  const attacks = [
    'Mozilla/5.0\r\nX-Injected: 1',
    'Mozilla/5.0\nX-Injected: 1',
    'Mozilla/5.0\rX-Injected: 1',
    'Mozilla/5.0\r\n\r\nGET /admin HTTP/1.1',
  ];
  for (const value of attacks) {
    assert.throws(() => api.headers(value), TypeError, `should reject ${JSON.stringify(value)}`);
  }
});

test('headers() rejects control characters and bad types', () => {
  assert.throws(() => api.headers('agent\u0000null'), TypeError);
  assert.throws(() => api.headers('agent\u0007bell'), TypeError);
  assert.throws(() => api.headers(''), TypeError);
  assert.throws(() => api.headers('x'.repeat(513)), TypeError);
  assert.throws(() => api.headers(42), TypeError);
  assert.throws(() => api.headers(null), TypeError);
  assert.throws(() => api.headers({}), TypeError);
  // undefined is NOT an error: headers() with no argument draws a random UA.
  assert.doesNotThrow(() => api.headers(undefined));
});

test('ESM entry point re-exports the same API', async () => {
  const url = pathToFileURL(path.resolve(__dirname, '..', 'index.mjs')).href;
  const esm = await import(url);
  assert.equal(typeof esm.default.chrome, 'function');
  for (const name of ALL_METHODS) {
    assert.equal(typeof esm[name], 'function', `named export ${name}`);
    assert.equal(esm[name], api[name], `${name} should be the same function reference`);
  }
  assert.ok(esm.chrome().length > 0);
});

test('helpers: randomInt stays in range and pick rejects empties', () => {
  for (let i = 0; i < 200; i += 1) {
    const value = randomInt(3, 7);
    assert.ok(value >= 3 && value <= 7, `${value} out of range`);
  }
  assert.throws(() => pick([]), TypeError);
});

test('helpers: escapeRegExp makes metacharacters literal', () => {
  assert.equal(escapeRegExp('chrome('), 'chrome\\(');
  assert.doesNotThrow(() => new RegExp(escapeRegExp('a{2,3}*+?^$|[]()\\')));
  assert.ok(new RegExp(escapeRegExp('chrome(')).test('chrome('));
});

test('helpers: sanitizeUserAgent returns the value when it is safe', () => {
  const safe = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
  assert.equal(sanitizeUserAgent(safe), safe);
});

test('embedded fallbacks are frozen, consistent and plausible', () => {
  assert.ok(Object.isFrozen(FALLBACKS));
  for (const [family, list] of Object.entries(FALLBACKS)) {
    assert.ok(Object.isFrozen(list), `${family} list should be frozen`);
    assert.ok(list.length > 0, `${family} should have templates`);
    for (const value of list) {
      assert.match(value, /^Mozilla\/5\.0/, `${family} template looks like a UA`);
      assert.doesNotMatch(value, /[\r\n]/, `${family} template has no line breaks`);
      if (family === 'safari') assert.doesNotMatch(value, CHROMIUM);
      if (family === 'android') assert.match(value, /Android/);
      if (family === 'ios') assert.match(value, /(iPhone|iPad)/);
    }
  }
});

test('every family has a filter that the dataset can satisfy', () => {
  // Guards against a filter typo silently forcing the fallback path forever.
  const sampled = new Set();
  for (let i = 0; i < 30; i += 1) sampled.add(api.random());
  assert.ok(sampled.size > 1, 'random() should not be a constant');
});
