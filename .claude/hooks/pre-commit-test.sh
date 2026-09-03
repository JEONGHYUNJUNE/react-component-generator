#!/usr/bin/env bash
# PreToolUse: Bash(git commit*) — bun run test 통과 시에만 커밋 허용

if ! bun run test >&2 2>&1; then
  printf '{"continue": false, "stopReason": "커밋 차단: bun run test 실패. 모든 테스트를 통과해야 커밋할 수 있습니다."}'
fi
