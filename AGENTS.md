# AGENTS.md — React Component Generator

## Operational Commands

```bash
bun install           # install dependencies
bun run dev           # start API server (port 3002) + Vite frontend (port 5173) concurrently
bun run server        # API server only (watch mode)
bun test              # run all tests (vitest, once)
bun test:watch        # run tests in watch mode
bun run build         # tsc type-check + vite build
bun run lint          # eslint
```

**Package manager: `bun` only. Do not use npm, yarn, or pnpm.**

## Golden Rules

### Immutable

- Never expose raw API key values to the client. `/api/config` returns only boolean flags (`!!ENV_KEYS.x`). Evidence: `server/index.ts:150-153`.
- Never add side effects (network calls, Bun.serve) to `server/generator.ts` or `server/fallback.ts`. These files exist as pure functions specifically to enable unit testing. Evidence: `server/generator.ts:1-3` comment, test files `server/generator.test.ts`, `server/fallback.test.ts`.

### Do's

- Add new Google models to the `GOOGLE_MODELS` array in `server/index.ts:5` — the `withModelFallback` fallback chain handles priority ordering automatically.
- Use `ensureRenderCall` + `stripCodeFences` together when post-processing any AI response. Evidence: `server/index.ts:188`.
- Keep `LiveProvider` with `noInline` prop at all times. react-live requires this when the code uses `render(...)`. Evidence: `src/components/LivePreview.tsx:14`.

### Don'ts

- Do not add fallback logic to `callAnthropic` — only Google uses `withModelFallback`. The asymmetry is intentional: Anthropic has one stable model, Google has multiple with different availability. Evidence: `server/index.ts:134-135` vs `server/index.ts:68-96`.
- Do not duplicate API key validation. It already exists at two layers: server (`resolveApiKey`, `server/index.ts:64-66`) and client (`hasEnvKey` check, `src/App.tsx:34-37`). Adding a third layer causes inconsistent error messages.
- Do not write TypeScript syntax in AI-generated component code (no type annotations, interfaces, generics, `as` casts). The system prompt explicitly forbids it and react-live does not support TypeScript. Evidence: `server/index.ts:SYSTEM_PROMPT` (line 20).
- Do not add import statements in AI-generated component code. React is globally available in the react-live sandbox. Evidence: `server/index.ts:SYSTEM_PROMPT` (line 8).
- Do not change ENV_KEYS initialization to lazy/dynamic — it is read at module startup, which is intentional. Consumers need to restart the server to pick up `.env` changes.

## Project Context

React-powered workbench: user enters a prompt, the Bun API server forwards it to Anthropic Claude or Google Gemini, the response is sanitized into valid react-live code, and the frontend renders a live preview.

Tech stack: React 19, TypeScript, Vite, Bun, react-live, vitest, @testing-library/react.

## Standards & References

- Commit messages: Korean conventional commits (use `/commit` skill).
- TypeScript strict mode via `tsconfig.app.json`.
- Tests live alongside source: `src/components/*.test.tsx`, `server/*.test.ts`.
- Git strategy: feature branches off `master`; PR to `main`.

**Maintenance:** If a Golden Rule contradicts what you observe in the code, the code is authoritative — update this file and note the change in your commit message.

## Context Map

- **[API server logic](./server/AGENTS.md)** — editing AI provider calls, fallback strategy, code post-processing, or server routes.
