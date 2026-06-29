# 계약서 법무 검토툴

계약서 초안 파일을 업로드하면 AI가 다음 항목을 자동으로 도출하는 Next.js + Vercel용 웹앱입니다.

- 전체 위험도
- 서명 가능 여부
- 핵심 리스크
- 조항별 검토표
- 수정 전·후 비교표
- 누락 조항
- 상대방에게 확인할 질문
- 최종 행동계획
- 1페이지 보고서

> 주의: 이 도구는 계약 검토 보조 도구입니다. 실제 분쟁, 고액 계약, 투자/양도/채무/보증 계약은 변호사 최종 검토가 필요합니다.

---

## 1. 지원 파일

- PDF
- DOCX
- HWPX
- TXT
- MD

현재 HWP 바이너리 파일은 직접 지원하지 않습니다. HWP는 PDF 또는 HWPX로 변환 후 업로드하세요. 스캔 PDF는 OCR 처리 후 업로드해야 텍스트 추출이 됩니다.

---

## 2. 로컬 실행

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

`.env.local`에 다음 값을 넣습니다.

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.5
```

브라우저에서 `http://localhost:3000` 접속 후 계약서를 업로드합니다.

---

## 3. GitHub 업로드

```bash
git init
git add .
git commit -m "Initial contract legal reviewer"
git branch -M main
git remote add origin https://github.com/본인계정/contract-law-reviewer.git
git push -u origin main
```

---

## 4. Vercel 배포

1. Vercel 접속
2. Add New Project
3. GitHub 저장소 선택
4. Framework Preset: Next.js
5. Environment Variables 추가
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` = `gpt-5.5`
6. Deploy

---

## 5. 사용 흐름

1. 계약서 업로드
2. 계약서 종류 입력
3. 우리 측 지위 입력
4. 상대방 지위 입력
5. 중점 검토사항 입력
6. 분석하기 클릭
7. 결과 확인
8. 마크다운 복사 또는 인쇄/PDF 저장

---

## 6. 커스터마이징 포인트

### 검토 기준 수정

`lib/prompt.ts` 파일의 `buildSystemPrompt()`를 수정하세요.

### 결과 JSON 구조 수정

`lib/schema.ts` 파일의 `contractReviewSchema`를 수정하세요.

### UI 수정

- `app/page.tsx`
- `app/components/ReviewResult.tsx`
- `app/globals.css`

---

## 7. 운영상 주의사항

- 계약서에는 개인정보와 영업비밀이 포함될 수 있으므로 저장 기능은 기본적으로 넣지 않았습니다.
- 업로드 파일은 서버에서 텍스트 추출 및 분석 요청에만 사용하고 별도 DB에 저장하지 않습니다.
- Vercel 무료/저가 플랜에서는 함수 실행 시간과 파일 용량 제한에 걸릴 수 있습니다.
- 대형 계약서는 10MB 이하, 텍스트 5만 자 이내 기준으로 운영하는 것을 권장합니다.
