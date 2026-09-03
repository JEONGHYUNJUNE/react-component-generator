# AGENTS.md — server/

Bun HTTP server (`Bun.serve`, port 3002) acting as an API proxy between the Vite frontend and Anthropic/Google AI providers. Vite proxies all `/api` requests here (`vite.config.ts:10-13`).

## Module Constraints

- Runtime: Bun only — Node.js APIs (e.g. `http`, `express`) are not available.
- No additional npm packages: use `fetch` (built into Bun), not axios or node-fetch.
- `server/index.ts` is excluded from vitest by the `include` pattern — only `*.test.ts` files paired with pure modules are run. Do not add tests for `Bun.serve` itself.

## Implementation Patterns

**Two-file separation:**
- `generator.ts` — pure string-transform functions (`stripCodeFences`, `ensureRenderCall`). No I/O.
- `fallback.ts` — pure async retry logic (`withModelFallback`). No provider-specific knowledge.
- `index.ts` — Bun.serve entry point. Imports and composes the above. Only place with side effects.

**Adding a new provider:**
1. Add the provider key to the `Provider` type (`src/types/index.ts:1`).
2. Add the env key to `ENV_KEYS` in `server/index.ts:59-62`.
3. Implement `callX(prompt, apiKey)` following the same signature as `callAnthropic`.
4. Wire it into the provider dispatch at `server/index.ts:183-186`.

**Google model list (`GOOGLE_MODELS`, `server/index.ts:5`):**
Array is ordered by preference — first entry is tried first, subsequent entries are fallbacks. `withModelFallback` handles the retry loop; do not add try/catch inside `callGoogleModel`.

## Local Golden Rules

### Hard Constraints

- `ensureRenderCall` auto-injects `render(<ComponentName />)` only when the component name starts with an uppercase letter (`generator.ts:19`). If you modify the regex, verify the uppercase constraint is preserved or the render injection silently fails.
- `LiveProvider` on the frontend uses `noInline` mode, so every generated snippet **must** end with a `render(...)` call. The system prompt enforces this; `ensureRenderCall` is the safety net. Both must remain in sync.
- Generated components must be plain JavaScript — no TypeScript syntax. react-live evaluates code at runtime in a JS context. Evidence: `SYSTEM_PROMPT` in `server/index.ts:20`.

### Asymmetric Error Handling (Google only)

`callGoogleModel` checks for `finishReason === 'MAX_TOKENS'` and throws a user-friendly Korean message (`server/index.ts:123-125`). Anthropic's response schema does not include this field — do not add an equivalent check to `callAnthropic` unless the Anthropic API begins returning it.

### Security

The `/api/config` response must only return boolean values for key presence (`!!ENV_KEYS.x`), never the key string itself. Evidence: `server/index.ts:150-153`. If you add new provider keys, apply the same `!!` pattern.

Client-supplied `apiKey` travels through `resolveApiKey` → provider call → external API. It must never appear in logs or response bodies.

### CORS

`CORS_HEADERS` uses `Access-Control-Allow-Origin: '*'` (`server/index.ts:52`). This is intentional for local development. Do not deploy this server publicly with real API keys without restricting the origin.
