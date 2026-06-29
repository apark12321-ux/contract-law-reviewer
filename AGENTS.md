# Repository Agent Instructions

이 저장소는 계약서 초안을 업로드해 법무 검토 결과를 도출하는 Next.js + Vercel 웹앱이다.

## 목표

- 파일 업로드 UI를 단순하게 유지한다.
- 계약서 분석 결과는 반드시 다음 기준으로 시각 구분한다.
  - 🟢 그대로 가능
  - 🟡 확인 필요
  - 🟠 협상 권장
  - 🔴 수정 필수
  - ⚫ 누락 조항
- 분석 결과에는 조항별 검토표, 수정 전·후 비교표, 누락 조항, 확인 질문, 최종 행동계획이 포함되어야 한다.
- 계약서 원문과 분석 결과는 기본적으로 서버에 저장하지 않는다.

## 중요한 파일

- `app/page.tsx`: 메인 업로드 화면
- `app/api/analyze/route.ts`: 파일 업로드, 텍스트 추출, OpenAI API 호출
- `lib/extractText.ts`: PDF/DOCX/HWPX/TXT/MD 텍스트 추출
- `lib/prompt.ts`: 법무 검토 프롬프트
- `lib/schema.ts`: Structured Outputs JSON Schema
- `app/components/ReviewResult.tsx`: 분석 결과 렌더링

## 개발 원칙

- Vercel 배포를 우선한다.
- Route Handler는 Node.js 런타임을 사용한다.
- OpenAI API Key는 클라이언트에 노출하지 않는다.
- 법률 판단은 확정적 단정보다는 실무 리스크와 수정 방향 중심으로 제시한다.
- 불필요한 회원가입/DB 기능은 추가하지 않는다.
