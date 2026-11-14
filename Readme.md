# User Agents Generator

> Generate realistic user agent strings for desktop and mobile browsers, sourced from a
> daily-updated dataset instead of hand-maintained version ranges.

`user-agents-generator` returns UA strings that describe browsers people actually run. Version
data comes from the maintained [`user-agents`](https://www.npmjs.com/package/user-agents)
dataset, weighted the way real traffic is weighted, so Chrome does not appear as often as
Opera. If the dataset cannot be resolved at runtime, the package falls back to embedded
templates rather than returning an empty string.

## Requirements

- Node.js >= 20 (Node 18 is end-of-life)
- Works with CommonJS and ESM. TypeScript declarations are included.

## Install

```bash
npm install user-agents-generator
```

## Usage

### CommonJS

```js
const ua = require('user-agents-generator');

console.log(ua.chrome());
console.log(ua.safari());
console.log(ua.android());
```

### ESM

```js
import ua, { chrome, generate, headers } from 'user-agents-generator';

console.log(ua.firefox());       // default export
console.log(chrome());           // named export
console.log(generate({ browser: 'edge', os: 'windows' }));
console.log(headers());          // ready-to-send request headers
```

### With Puppeteer or Playwright

```js
import puppeteer from 'puppeteer';
import { chrome, headers } from 'user-agents-generator';

const userAgent = chrome();

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setUserAgent(userAgent);
await page.setExtraHTTPHeaders(headers(userAgent));
await page.goto('https://example.com');
await browser.close();
```

## API

Every method returns a `string` unless noted otherwise.

### Legacy methods

These kept their v1 names and signatures, so upgrading does not require code changes.

| Method | Returns |
| --- | --- |
| `chrome()` | Chrome on desktop |
| `firefox()` | Firefox on desktop |
| `safari()` | Safari on desktop, Apple platforms only. Never a Chromium-family UA |
| `android()` | Chrome on Android |
| `ios()` | Safari on iOS |

### Added in v2

| Method | Returns |
| --- | --- |
| `edge()` | Microsoft Edge on desktop |
| `opera()` | Opera on desktop |
| `random()` | Any family, weighted by the dataset |
| `generate(options?)` | A UA matching the given constraints |
| `headers(ua?)` | Request header object containing `User-Agent` |

#### `generate(options)`

| Option | Type | Description |
| --- | --- | --- |
| `browser` | `string` | A known family (`chrome`, `firefox`, `safari`, `edge`, `opera`, `android`, `ios`) or any literal substring |
| `os` | `string` | `windows`, `macos`, `linux`, `android`, `ios`, or any literal substring |
| `device` | `string` | `desktop`, `mobile` or `tablet` |

```js
generate();                                  // unconstrained weighted draw
generate({ browser: 'chrome' });             // desktop Chrome
generate({ browser: 'firefox', os: 'linux' });
generate({ device: 'mobile' });
generate({ browser: 'safari' });             // WebKit only, never Chromium
```

Notes:

- Caller strings are regex-escaped before matching, so `generate({ browser: 'chrome(' })` is safe
  and does not throw.
- A constraint that matches nothing degrades to an unconstrained draw instead of throwing.
- Passing anything other than an object throws `TypeError`.

#### `headers(ua?)`

```js
headers();
// {
//   'User-Agent': 'Mozilla/5.0 ...',
//   Accept: 'text/html,application/xhtml+xml,...',
//   'Accept-Language': 'en-US,en;q=0.9',
//   'Accept-Encoding': 'gzip, deflate, br'
// }
```

`headers()` validates the UA it is given. Strings containing CR, LF or other control characters,
empty strings and strings longer than 512 characters throw `TypeError`. Rejection is deliberate:
silently stripping a CRLF would hide a header-injection attempt.

## Design notes

- **Dataset first, templates second.** The dataset is read once at require time. A failed
  resolve (pruned install, offline cache) degrades to frozen embedded 2025-era templates.
- **Family filters are predicates, not substrings.** `safari()` requires `Safari/`, `Version/`
  and `AppleWebKit/` while excluding every Chromium partner token, because a Chrome UA also
  contains `Safari/`.
- **One module instance.** `index.mjs` re-exports `index.cjs` instead of reimplementing it, so
  CJS and ESM consumers cannot end up with two copies of the dataset.

## Development

```bash
npm ci
npm test        # node:test suite
npm run audit   # npm audit --omit=dev
```

## Migrating from v1

| v1 | v2 |
| --- | --- |
| `npm install user-agent-generator` (wrong name) | `npm install user-agents-generator` |
| Node.js any version | Node.js >= 20 |
| Hard-coded, outdated UA ranges | Dataset-sourced, daily-updated UAs |
| No tests, CI or types | node:test, GitHub Actions, TypeScript declarations |
| `safari()` could return Chrome or Edge | `safari()` returns Safari only |
| CommonJS only | CommonJS + ESM |

UA strings are not byte-identical to v1: they now describe current browsers.

## License

MIT
