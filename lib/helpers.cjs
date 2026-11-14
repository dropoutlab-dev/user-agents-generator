'use strict';

/** Small, dependency-free helpers shared by the public API. */

/**
 * Random integer in [min, max] inclusive.
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randomInt(min, max) {
  const lo = Math.ceil(Math.min(min, max));
  const hi = Math.floor(Math.max(min, max));
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

/**
 * Pick a random element from a non-empty array.
 * @template T
 * @param {readonly T[]} list
 * @returns {T}
 */
function pick(list) {
  if (!Array.isArray(list) || list.length === 0) {
    throw new TypeError('pick(list) requires a non-empty array');
  }
  return list[randomInt(0, list.length - 1)];
}

/**
 * Escape every regex metacharacter so caller input is matched literally.
 * This is what stops generate({ browser: 'chrome(' }) from throwing
 * "Invalid regular expression: Unterminated group".
 * @param {string} value
 * @returns {string}
 */
function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Control characters, excluding horizontal tab. */
// eslint-disable-next-line no-control-regex
const UNSAFE = /[\u0000-\u0008\u000a-\u001f\u007f]/;
const CRLF = /[\r\n]/;

/**
 * Validate a user agent string before it is placed into a header map.
 * CR and LF are the header-injection vector, so they are rejected rather than
 * stripped: silently rewriting caller input hides the attempt.
 * @param {unknown} value
 * @returns {string}
 */
function sanitizeUserAgent(value) {
  if (typeof value !== 'string') {
    throw new TypeError('user agent must be a string');
  }
  if (value.length === 0 || value.length > 512) {
    throw new TypeError('user agent must be between 1 and 512 characters');
  }
  if (CRLF.test(value)) {
    throw new TypeError('user agent must not contain CR or LF characters');
  }
  if (UNSAFE.test(value)) {
    throw new TypeError('user agent must not contain control characters');
  }
  return value;
}

module.exports = { randomInt, pick, escapeRegExp, sanitizeUserAgent };
