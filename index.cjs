/*
 * @title user-agents-generator
 * @desc Generate realistic user agent strings for browsers and mobile devices.
 * @version 2.0.0
 * @license MIT
 */

'use strict';

const { FALLBACKS } = require('./lib/fallbacks.cjs');
const { pick } = require('./lib/helpers.cjs');

/**
 * The `user-agents` dataset is loaded once at require time. If it cannot be
 * resolved (pruned install, offline cache), every method still returns a
 * realistic string from the embedded fallbacks instead of throwing.
 */
let UserAgent = null;
try {
  const mod = require('user-agents');
  if (typeof mod === 'function') {
    UserAgent = mod;
  } else if (mod && typeof mod.default === 'function') {
    UserAgent = mod.default;
  }
} catch {
  UserAgent = null;
}

/** Vendor tokens that ride on a Chromium UA and must not pass as plain Chrome. */
const CHROMIUM_PARTNERS =
  /(Edg|EdgA|EdgiOS|OPR|Opera|SamsungBrowser|CriOS|FxiOS|Vivaldi|YaBrowser|Brave|Silk|UCBrowser)/i;

const isDesktop = (entry) => entry.deviceCategory === 'desktop';
const ua = (entry) => String(entry.userAgent || '');

/**
 * One filter per family. These are functions because the dataset accepts them
 * as predicates over the raw record, which lets us express exclusions that a
 * plain substring filter cannot.
 */
const FAMILIES = {
  chrome: (entry) => isDesktop(entry) && /Chrome\//.test(ua(entry)) && !CHROMIUM_PARTNERS.test(ua(entry)),
  firefox: (entry) => isDesktop(entry) && /Firefox\//.test(ua(entry)),
  // Safari, correctly: WebKit only, rendered by Apple, and never a Chromium
  // build wearing a Safari/ token. v1 could return Chrome and Edge here.
  safari: (entry) =>
    isDesktop(entry) &&
    /Safari\//.test(ua(entry)) &&
    /Version\//.test(ua(entry)) &&
    /AppleWebKit\//.test(ua(entry)) &&
    !/Chrome\//.test(ua(entry)) &&
    !CHROMIUM_PARTNERS.test(ua(entry)),
  edge: (entry) => isDesktop(entry) && /Edg\//.test(ua(entry)),
  opera: (entry) => isDesktop(entry) && /OPR\//.test(ua(entry)),
  android: (entry) => /Android/.test(ua(entry)) && /Mobile/.test(ua(entry)),
  ios: (entry) => /(iPhone|iPad|iPod)/.test(ua(entry)),
};

const FAMILY_NAMES = Object.keys(FAMILIES);

/**
 * Draw one record from the dataset, weighted as the dataset intends.
 * @param {string} family
 * @returns {string|null} null when the dataset is absent or has no match
 */
function fromDataset(family) {
  if (!UserAgent) return null;
  const filter = FAMILIES[family];
  if (!filter) return null;
  try {
    const value = String(new UserAgent(filter));
    return value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

/**
 * Resolve a UA for a family: dataset first, embedded template second.
 * @param {string} family
 * @returns {string}
 */
function resolve(family) {
  const fromData = fromDataset(family);
  if (fromData) return fromData;
  return pick(FALLBACKS[family] || FALLBACKS.chrome);
}

/** @returns {string} Chrome on desktop */
function chrome() {
  return resolve('chrome');
}

/** @returns {string} Firefox on desktop */
function firefox() {
  return resolve('firefox');
}

/** @returns {string} Safari on desktop Apple platforms only */
function safari() {
  return resolve('safari');
}

/** @returns {string} Chrome on Android */
function android() {
  return resolve('android');
}

/** @returns {string} Safari on iOS */
function ios() {
  return resolve('ios');
}

module.exports = {
  chrome,
  firefox,
  safari,
  android,
  ios,
};
