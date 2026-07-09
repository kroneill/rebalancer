# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```
npm ci               # install deps (use over `npm install` unless adding/updating a dep)
npm run typecheck     # tsc --noEmit
npm test              # vitest run (single run, all tests)
npm test -- greet     # run a single test file/pattern, e.g. vitest run src/greet.test.ts
npm run test:watch    # vitest in watch mode
npm run dev           # run src/index.ts directly via node --watch
npm run build         # compile to dist/
```

Node version is pinned in `.nvmrc` (24); run `fnm use` before working. CI (`.github/workflows/ci.yml`) runs `npm ci && npm run typecheck && npm test` on every push.

## Architecture

- Entry point is `src/index.ts`; other modules live alongside it in `src/`.
- Tests are colocated as `*.test.ts` next to the code they cover, run with vitest.
- `vitest.config.ts` restricts test discovery to `src/**/*.test.ts` — without this, vitest also picks up compiled `*.test.js` files under the git-ignored `dist/`, double-running every test after a local `npm run build`. Keep this scoping if adding vitest config.
- TypeScript is configured (`tsconfig.json`) with `module: nodenext` + `verbatimModuleSyntax`, so relative imports must include the `.ts` extension (e.g. `import { greet } from "./greet.ts"`) — this is intentional, not an error to "fix".
