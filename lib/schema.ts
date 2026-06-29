export const contractReviewSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    meta: {
      type: "object",
      additionalProperties: false,
      properties: {
        documentName: { type: "string" },
        contractType: { type: "string" },
        userPosition: { type: "string" },
        counterpartyPosition: { type: "string" },
        overallRisk: { type: "string", enum: ["낮음", "보통", "높음", "서명 보류"] },
        signRecommendation: {
          type: "string",
          enum: [
            "그대로 서명 가능",
            "일부 문구 수정 후 서명 가능",
            "핵심 조항 협상 후 서명 가능",
            "현재 상태에서는 서명 보류",
            "전면 재작성 필요"
          ]
        },
        summary: { type: "string" },
        legalDisclaimer: { type: "string" }
      },
      required: [
        "documentName",
        "contractType",
        "userPosition",
        "counterpartyPosition",
        "overallRisk",
        "signRecommendation",
        "summary",
        "legalDisclaimer"
      ]
    },
    keyRisks: { type: "array", items: { type: "string" } },
    clauseReviews: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          clause: { type: "string" },
          originalSummary: { type: "string" },
          grade: { type: "string", enum: ["🟢 그대로 가능", "🟡 확인 필요", "🟠 협상 권장", "🔴 수정 필수", "⚫ 누락 조항"] },
          issue: { type: "string" },
          impact: { type: "string" },
          recommendation: { type: "string" }
        },
        required: ["clause", "originalSummary", "grade", "issue", "impact", "recommendation"]
      }
    },
    revisions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          level: { type: "string", enum: ["🟡 확인 필요", "🟠 협상 권장", "🔴 수정 필수", "⚫ 누락 조항"] },
          originalText: { type: "string" },
          revisedText: { type: "string" },
          reason: { type: "string" }
        },
        required: ["level", "originalText", "revisedText", "reason"]
      }
    },
    missingClauses: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          whyNeeded: { type: "string" },
          suggestedText: { type: "string" }
        },
        required: ["title", "whyNeeded", "suggestedText"]
      }
    },
    questions: { type: "array", items: { type: "string" } },
    finalActionPlan: { type: "array", items: { type: "string" } },
    onePageReport: { type: "string" }
  },
  required: [
    "meta",
    "keyRisks",
    "clauseReviews",
    "revisions",
    "missingClauses",
    "questions",
    "finalActionPlan",
    "onePageReport"
  ]
} as const;

export type ReviewGrade = "🟢 그대로 가능" | "🟡 확인 필요" | "🟠 협상 권장" | "🔴 수정 필수" | "⚫ 누락 조항";

export type ContractReview = {
  meta: {
    documentName: string;
    contractType: string;
    userPosition: string;
    counterpartyPosition: string;
    overallRisk: "낮음" | "보통" | "높음" | "서명 보류";
    signRecommendation:
      | "그대로 서명 가능"
      | "일부 문구 수정 후 서명 가능"
      | "핵심 조항 협상 후 서명 가능"
      | "현재 상태에서는 서명 보류"
      | "전면 재작성 필요";
    summary: string;
    legalDisclaimer: string;
  };
  keyRisks: string[];
  clauseReviews: Array<{
    clause: string;
    originalSummary: string;
    grade: ReviewGrade;
    issue: string;
    impact: string;
    recommendation: string;
  }>;
  revisions: Array<{
    level: Exclude<ReviewGrade, "🟢 그대로 가능">;
    originalText: string;
    revisedText: string;
    reason: string;
  }>;
  missingClauses: Array<{
    title: string;
    whyNeeded: string;
    suggestedText: string;
  }>;
  questions: string[];
  finalActionPlan: string[];
  onePageReport: string;
};
