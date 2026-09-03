#!/usr/bin/env bash
# PostToolUse: Write|Edit — .ts/.tsx 수정 시 TDD 규칙 리마인더

fp=$(jq -r '.tool_input.file_path // ""')

if echo "$fp" | grep -qE '\.(ts|tsx)$'; then
  printf '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"TDD 규칙 체크 (.claude/rules/tdd.md): .ts/.tsx 파일을 수정했습니다. 반드시 확인하세요. (1) 이 코드에 대응하는 테스트를 먼저 작성했나요? (2) bun run test로 RED 실패를 눈으로 확인했나요? 프로덕션 코드를 테스트 없이 먼저 작성했다면 즉시 삭제하고 RED부터 재시작하세요."}}'
fi
