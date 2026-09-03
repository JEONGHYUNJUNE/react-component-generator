---
name: create-pr
description: >
  GitHub PR을 생성하는 스킬. 변경사항을 분석하고 PR 제목·본문을 작성한 뒤 사용자 승인 후 PR을 올린다.
  "PR 만들어줘", "PR 생성해줘", "풀 리퀘스트 올려줘", "PR 올려줘", "PR 날려줘", "create PR",
  "open a pull request", "PR 제출", "PR 열어줘" 등 PR 생성 요청 시 반드시 이 스킬을 사용하라.
  커밋이 완료된 후 GitHub에 변경사항을 공유하려는 모든 상황에서 이 스킬을 활성화하라.
context: fork
allowed-tools: Read Glob Grep Bash
---

# create-pr 스킬

현재 브랜치의 변경사항을 분석하고, 프로젝트 성격에 맞는 템플릿으로 PR 본문을 작성한다.
서브에이전트로 실행되어 PR을 생성하고, 완료된 PR URL만 메인 대화로 반환한다.

## 전제 조건 확인

```bash
# 현재 브랜치와 베이스 브랜치 파악
git branch --show-current
git remote -v

# 미커밋 변경사항 확인 (있으면 커밋 먼저 요청)
git status --short
```

미커밋 변경사항이 있으면 중단하고 사용자에게 먼저 커밋하도록 안내한다.

## 1단계: 프로젝트 성격 판단

아래 순서로 확인한다:

```bash
# 오픈소스 판단 기준 파일 확인
ls CONTRIBUTING.md CONTRIBUTORS.md LICENSE LICENSE.md LICENSE.txt 2>/dev/null
```

**영문 템플릿** 사용 조건 — 아래 중 하나라도 해당:
- `LICENSE`, `CONTRIBUTING.md` 등이 존재
- 리모트 URL이 조직 계정 소속
- 사용자가 "오픈소스" / "open source" / "외부 기여" 언급

그 외는 **한국어 템플릿**을 사용한다.

템플릿 내용은 `references/pr-template.md`를 읽어 참고한다.

## 2단계: 변경사항 분석

```bash
# 베이스 브랜치 결정 (main > master 순으로 시도)
BASE=$(git remote show origin 2>/dev/null | grep 'HEAD branch' | awk '{print $NF}')
[ -z "$BASE" ] && BASE="main"

# 이 브랜치에서 새로 추가된 커밋 목록
git log origin/$BASE..HEAD --oneline 2>/dev/null || git log HEAD~5..HEAD --oneline

# 변경된 파일 목록
git diff --name-only origin/$BASE...HEAD 2>/dev/null || git diff --name-only HEAD~1..HEAD

# 변경 내용 요약 (첫 200줄)
git diff --stat origin/$BASE...HEAD 2>/dev/null | head -30
```

## 3단계: PR 제목·본문 작성

**제목 규칙:**
- 50자 이내, 명령형
- 영문 템플릿: `feat: Add prompt length validation` 형식
- 한국어 템플릿: `feat: 프롬프트 길이 유효성 검사 추가` 형식
- 커밋이 1개면 그 커밋 메시지를 제목으로 활용

**본문:** 선택한 템플릿의 섹션을 채운다. 커밋 목록과 diff stat을 토대로 구체적으로 작성하되, 불필요한 placeholder 주석(`<!-- -->`)은 제거한다.

## 4단계: 사용자에게 PR 초안 제시

아래 형식으로 보여주고 승인을 받는다:

```
PR 초안:

제목: feat: 프롬프트 길이 유효성 검사 추가
베이스 브랜치: main ← feature/prompt-validation

---
## 요약
500자 초과 입력을 실시간으로 검사하여 생성 버튼을 비활성화하고 에러 메시지를 표시한다.

## 주요 변경 내용
- validatePromptLength 유틸리티 함수 추가 (src/utils/validatePrompt.ts)
- PromptInput 컴포넌트에 실시간 검사 통합
- 에러 스타일 추가 (App.css)

## 테스트 방법
- 501자 입력 시 에러 메시지 및 버튼 비활성화 확인
- 500자 이하에서 정상 동작 확인
- `bun test` 전체 통과 확인

## 관련 이슈
없음

## 체크리스트
- [x] 테스트 추가 또는 수정
- [ ] 문서 업데이트 (해당 시)
- [x] 하위 호환성 유지
---

이대로 PR을 생성할까요? (수정이 필요하면 말씀해주세요)
```

## 5단계: 승인 후 PR 생성

승인이 나면:

```bash
# 현재 브랜치를 원격에 푸시 (아직 안 된 경우)
git push -u origin $(git branch --show-current)

# PR 생성
gh pr create \
  --title "<제목>" \
  --body "$(cat <<'EOF'
<본문>
EOF
)" \
  --base <베이스 브랜치>
```

PR 생성 후 반환된 URL을 메인 대화에 출력한다.

```
PR이 생성되었습니다: https://github.com/owner/repo/pull/123
```

## 주의사항

- **사용자 승인 없이 PR을 생성하지 않는다.** 4단계 제시 후 반드시 확인을 받는다.
- 현재 브랜치가 베이스 브랜치(`main`/`master`)와 동일하면 경고하고 중단한다.
- 이미 동일 브랜치의 열린 PR이 있으면 기존 PR URL을 안내하고 중단한다:
  ```bash
  gh pr list --head $(git branch --show-current) --state open
  ```
- `--draft` 여부는 사용자가 "draft", "임시", "WIP" 등을 언급할 때만 추가한다.
