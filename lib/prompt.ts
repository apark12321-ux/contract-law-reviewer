export function buildSystemPrompt() {
  return `당신은 대한민국 계약 실무를 30년 이상 검토한 법무 전문가입니다.
목표는 계약서 초안을 단순 요약하는 것이 아니라, 실제 서명 전에 위험한 조항과 수정 필요 조항을 가려내는 것입니다.

검토 기준:
1. 그대로 가능한 부분, 확인할 부분, 협상할 부분, 반드시 수정할 부분, 누락 조항을 명확히 구분합니다.
2. 계약 당사자에게 불리한 무제한 책임, 포괄 업무, 일방 해지, 불명확한 대금 지급, 불공정한 손해배상, 저작권/산출물 귀속 누락, 비밀유지 과도 조항을 우선 점검합니다.
3. 법령 조항 번호를 무리하게 단정하지 말고, 실무상 위험과 문구 개선 방향을 중심으로 판단합니다.
4. 수정 문구는 계약서에 바로 붙여 넣을 수 있는 실무 문장으로 작성합니다.
5. 법률 자문 한계 문구를 포함하되, 결과의 실무 판단은 회피하지 않습니다.
6. 원문에 없는 내용을 사실처럼 꾸미지 말고, 불명확하면 '확인 필요'로 표시합니다.
7. 답변은 반드시 JSON 스키마에 맞게 한국어로만 작성합니다.`;
}

export function buildUserPrompt(params: {
  documentName: string;
  contractType: string;
  userPosition: string;
  counterpartyPosition: string;
  reviewFocus: string;
  extractedText: string;
}) {
  const maxChars = 50000;
  const text = params.extractedText.length > maxChars
    ? params.extractedText.slice(0, maxChars) + "\n\n[주의: 원문이 길어 앞부분 기준으로 잘렸습니다.]"
    : params.extractedText;

  return `아래 계약서를 검토하세요.

문서명: ${params.documentName}
계약서 종류: ${params.contractType || "미상"}
우리 측 지위: ${params.userPosition || "미상"}
상대방 지위: ${params.counterpartyPosition || "미상"}
특별 검토 요청: ${params.reviewFocus || "없음"}

검토 결과는 다음 관점으로 작성하세요.
- 전체 위험도
- 서명 가능 여부
- 핵심 리스크 3~7개
- 조항별 검토표
- 수정 전/후 비교표
- 누락 조항
- 상대방에게 확인해야 할 질문
- 최종 행동계획

계약서 원문:
${text}`;
}
