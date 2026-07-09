# rebalancer

A TypeScript/Node.js project.

## Project layout

```
src/            source files, e.g. src/index.ts is the entry point
src/*.test.ts   tests, colocated with the code they test (run via vitest)
dist/           compiled output (git-ignored, created by `npm run build`)
```

## Prerequisites

- Node.js 24 (see `.nvmrc`). If you use [fnm](https://github.com/Schniz/fnm), just run
  `fnm use` in this directory and it'll pick up the right version automatically.

## Setup

```
npm ci
```

This installs dependencies using the exact versions locked in `package-lock.json`.
Prefer it over `npm install` here and in CI: `npm install` will update the lockfile
if `package.json` and the lockfile ever drift apart, while `npm ci` refuses to run
in that case and deletes `node_modules` first for a clean, reproducible install.
Use `npm install` only when you're intentionally adding/updating a dependency.

## Commands

```
npm run typecheck   # type-check without emitting
npm test            # run tests once
npm run test:watch  # run tests in watch mode
npm run dev         # run src/index.ts directly, restarting on changes
npm run build       # compile to dist/
```

## CI

`.github/workflows/ci.yml` runs `npm ci && npm run typecheck && npm test` on every push.
