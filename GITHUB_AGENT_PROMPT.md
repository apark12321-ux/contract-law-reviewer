# GitHub/Codex Agent에게 넣을 프롬프트

아래 요구사항대로 현재 저장소에 Next.js + Vercel용 계약서 법무 검토 웹앱을 구현해줘.

## 제품명
계약서 법무 검토툴

## 핵심 기능
1. 사용자가 계약서 파일을 업로드한다.
2. 지원 파일은 PDF, DOCX, HWPX, TXT, MD다. HWP는 직접 지원하지 않고 PDF/HWPX 변환 안내를 표시한다.
3. 사용자는 계약서 종류, 우리 측 지위, 상대방 지위, 중점 검토사항을 입력한다.
4. 서버에서 문서 텍스트를 추출한다.
5. OpenAI Responses API를 호출해 계약서 법무 검토 결과를 JSON Schema 형식으로 받는다.
6. 결과를 다음 기준으로 시각 구분한다.
   - 🟢 그대로 가능
   - 🟡 확인 필요
   - 🟠 협상 권장
   - 🔴 수정 필수
   - ⚫ 누락 조항
7. 결과 화면에는 다음 섹션을 표시한다.
   - 계약서 총평
   - 전체 위험도
   - 서명 가능 여부
   - 핵심 리스크
   - 조항별 검토표
   - 수정 전·후 비교표
   - 빠진 조항
   - 상대방에게 확인할 질문
   - 최종 행동계획
   - 1페이지 보고서
8. 결과는 마크다운 복사, JSON 복사, 인쇄/PDF 저장이 가능해야 한다.

## 기술 조건
- Next.js App Router 사용
- `/app/api/analyze/route.ts` Route Handler 사용
- Node.js runtime 사용
- OpenAI API Key는 서버 환경변수 `OPENAI_API_KEY`에서만 읽는다.
- 모델명은 `OPENAI_MODEL` 환경변수에서 읽고, 없으면 `gpt-5.5`를 기본값으로 사용한다.
- 업로드 파일과 분석 결과는 DB에 저장하지 않는다.
- Vercel 배포가 가능해야 한다.

## 보안/개인정보 조건
- API Key를 클라이언트에 노출하지 말 것
- 업로드 파일을 영구 저장하지 말 것
- 10MB 초과 파일은 거절할 것
- 스캔 PDF에서 텍스트가 추출되지 않으면 OCR 후 업로드하라는 오류를 표시할 것

## UI 방향
- 한국어 UI
- 법무 검토 문서처럼 신뢰감 있는 디자인
- 위험도 색상 구분
- 표와 카드 중심의 결과 화면
- 모바일에서도 읽기 가능

## 반드시 구현할 파일
- `app/page.tsx`
- `app/api/analyze/route.ts`
- `app/components/ReviewResult.tsx`
- `app/globals.css`
- `lib/extractText.ts`
- `lib/prompt.ts`
- `lib/schema.ts`
- `.env.local.example`
- `README.md`
