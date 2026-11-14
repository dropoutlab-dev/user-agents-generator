/**
 * Type declarations for user-agents-generator v2.
 * The implementation is CommonJS (index.cjs); index.mjs re-exports it so both
 * module systems observe the same instance.
 */

/** Browser families that have a first-class filter. */
export type Browser =
  | 'chrome'
  | 'firefox'
  | 'safari'
  | 'edge'
  | 'opera'
  | 'android'
  | 'ios';

/** Operating systems recognised by generate(). Unknown values are matched literally. */
export type OperatingSystem = 'windows' | 'macos' | 'linux' | 'android' | 'ios';

/** Device classes present in the dataset. */
export type DeviceCategory = 'desktop' | 'mobile' | 'tablet';

export interface GenerateOptions {
  /** Browser family, or any substring to match literally against the UA. */
  browser?: Browser | string;
  /** Operating system, or any substring to match literally against the UA. */
  os?: OperatingSystem | string;
  /** Device class. */
  device?: DeviceCategory | string;
}

/** Chrome on desktop. */
export declare function chrome(): string;
/** Firefox on desktop. */
export declare function firefox(): string;
/** Safari on desktop Apple platforms. Never a Chromium-family UA. */
export declare function safari(): string;
/** Chrome on Android. */
export declare function android(): string;
/** Safari on iOS. */
export declare function ios(): string;
/** Microsoft Edge on desktop. */
export declare function edge(): string;
/** Opera on desktop. */
export declare function opera(): string;
/** Any family, weighted by the dataset. */
export declare function random(): string;
/**
 * Generate a UA under optional constraints.
 * Unknown or unsatisfiable constraints fall back to an unconstrained draw
 * rather than throwing.
 * @throws {TypeError} when `options` is not an object.
 */
export declare function generate(options?: GenerateOptions): string;
/**
 * Request headers carrying a UA.
 * @param userAgent defaults to a random UA.
 * @throws {TypeError} when `userAgent` contains CR, LF, control characters,
 * is empty, or exceeds 512 characters.
 */
export declare function headers(userAgent?: string): Record<string, string>;

export interface UserAgentsGenerator {
  chrome: typeof chrome;
  firefox: typeof firefox;
  safari: typeof safari;
  android: typeof android;
  ios: typeof ios;
  edge: typeof edge;
  opera: typeof opera;
  random: typeof random;
  generate: typeof generate;
  headers: typeof headers;
}

declare const api: UserAgentsGenerator;
export default api;
