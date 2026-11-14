# Changelog

All notable changes to this project are documented here. This project follows
[Semantic Versioning](https://semver.org/).

## [2.0.0] - 2026-11-14

First maintained release since 1.0.2. Major because the runtime requirement, the UA source and
one behavioural fix are all breaking.

### Added

- `edge()`, `opera()`, `random()` methods.
- `generate(options)` for constrained generation by `browser`, `os` and `device`.
- `headers(ua?)` returning a request header map with a validated `User-Agent`.
- ESM entry point (`index.mjs`) alongside CommonJS (`index.cjs`).
- TypeScript declarations (`index.d.ts`) covering all ten methods.
- `node:test` suite (23 tests) covering the legacy API, the new API, header injection, regex
  escaping and the CJS/ESM identity contract.
- GitHub Actions CI on Node 20, 22 and 24, including `npm audit --omit=dev` and entry-point
  smoke tests.
- Dependabot configuration for npm and GitHub Actions.
- Embedded 2025-era fallback templates used when the dataset cannot be resolved.

### Changed

- User agent strings are sourced from the maintained `user-agents` dataset, weighted by real
  traffic distribution, instead of being synthesised from `Math.random()` version ranges.
- `package.json` metadata corrected: `repository.url` is now a valid HTTPS remote (was a
  malformed `git+ssh` URL), and `bugs.url` no longer points at a misspelled owner.
- Added an `exports` map plus `files` allow-list, so only intended files are published.
- `engines.node` is `>=20`.
- `Readme.md` rewritten: the install command referenced the wrong package name
  (`user-agent-generator`).

### Fixed

- `safari()` no longer returns Chrome, Edge, Opera or other Chromium-family UAs. A Safari UA must
  be WebKit-only, which a plain `Safari/` substring match could not guarantee.
- `chrome()` no longer returns Edge or Opera UAs.
- `generate()` escapes caller-supplied strings before they become a `RegExp`, so metacharacters
  such as `chrome(` cannot raise `SyntaxError`.
- `headers()` rejects CR and LF, closing a header-injection vector.

### Breaking changes

- Minimum Node.js version is 20. Node 18 is end-of-life.
- UA strings are dataset-sourced and are not byte-identical to 1.x output.
- `safari()` no longer returns Chromium-family UAs.
- The package main entry is now `index.cjs`; deep imports of `index.js` will not resolve.

## [1.0.2]

- Unmaintained. Superseded by 2.0.0; do not use.
