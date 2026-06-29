"use client";

import type { ContractReview, ReviewGrade } from "@/lib/schema";

function gradeClass(grade: string) {
  if (grade.includes("그대로")) return "badge safe";
  if (grade.includes("확인")) return "badge check";
  if (grade.includes("협상")) return "badge negotiate";
  if (grade.includes("수정")) return "badge danger";
  return "badge missing";
}

function riskClass(risk: string) {
  if (risk === "낮음") return "safeText";
  if (risk === "보통") return "checkText";
  if (risk === "높음") return "negotiateText";
  return "dangerText";
}

function toMarkdown(review: ContractReview) {
  const lines: string[] = [];
  lines.push("# 계약서 법무 검토 결과", "");
  lines.push(`- 문서명: ${review.meta.documentName}`);
  lines.push(`- 계약서 종류: ${review.meta.contractType}`);
  lines.push(`- 우리 측 지위: ${review.meta.userPosition}`);
  lines.push(`- 상대방 지위: ${review.meta.counterpartyPosition}`);
  lines.push(`- 전체 위험도: ${review.meta.overallRisk}`);
  lines.push(`- 서명 판단: ${review.meta.signRecommendation}`, "");
  lines.push("## 총평", review.meta.summary, "");
  lines.push("## 핵심 리스크");
  review.keyRisks.forEach((risk, index) => lines.push(`${index + 1}. ${risk}`));
  lines.push("", "## 조항별 검토");
  review.clauseReviews.forEach((item) => {
    lines.push(`### ${item.clause} ${item.grade}`);
    lines.push(`- 원문 요약: ${item.originalSummary}`);
    lines.push(`- 문제점: ${item.issue}`);
    lines.push(`- 영향: ${item.impact}`);
    lines.push(`- 수정 방향: ${item.recommendation}`, "");
  });
  lines.push("## 수정 전/후 비교");
  review.revisions.forEach((item, index) => {
    lines.push(`### ${index + 1}. ${item.level}`);
    lines.push(`기존 문구: ${item.originalText}`, "");
    lines.push(`수정 문구: ${item.revisedText}`, "");
    lines.push(`수정 사유: ${item.reason}`, "");
  });
  lines.push("## 누락 조항");
  review.missingClauses.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.title}`);
    lines.push(`- 필요 이유: ${item.whyNeeded}`);
    lines.push(`- 제안 문구: ${item.suggestedText}`);
  });
  lines.push("", "## 확인 질문");
  review.questions.forEach((q, index) => lines.push(`${index + 1}. ${q}`));
  lines.push("", "## 최종 행동계획");
  review.finalActionPlan.forEach((q, index) => lines.push(`${index + 1}. ${q}`));
  lines.push("", `> ${review.meta.legalDisclaimer}`);
  return lines.join("\n");
}

export default function ReviewResult({ review }: { review: ContractReview }) {
  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(toMarkdown(review));
    alert("검토 결과가 마크다운 형식으로 복사되었습니다.");
  };

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(review, null, 2));
    alert("검토 결과 JSON이 복사되었습니다.");
  };

  const countByGrade = (grade: ReviewGrade) => review.clauseReviews.filter((item) => item.grade === grade).length;

  return (
    <section className="resultWrap">
      <div className="resultHeader card">
        <div>
          <p className="eyebrow">계약서 법무 검토 결과</p>
          <h2>{review.meta.documentName}</h2>
          <p className="muted">{review.meta.summary}</p>
        </div>
        <div className="actions">
          <button type="button" onClick={copyMarkdown}>마크다운 복사</button>
          <button type="button" onClick={copyJson}>JSON 복사</button>
          <button type="button" onClick={() => window.print()}>인쇄/PDF 저장</button>
        </div>
      </div>

      <div className="grid stats">
        <div className="card stat"><span>전체 위험도</span><strong className={riskClass(review.meta.overallRisk)}>{review.meta.overallRisk}</strong></div>
        <div className="card stat"><span>서명 판단</span><strong>{review.meta.signRecommendation}</strong></div>
        <div className="card stat"><span>수정 필수</span><strong className="dangerText">{countByGrade("🔴 수정 필수")}</strong></div>
        <div className="card stat"><span>협상 권장</span><strong className="negotiateText">{countByGrade("🟠 협상 권장")}</strong></div>
      </div>

      <div className="card">
        <h3>핵심 리스크</h3>
        <ol className="riskList">
          {review.keyRisks.map((risk, index) => <li key={index}>{risk}</li>)}
        </ol>
      </div>

      <div className="card tableCard">
        <h3>조항별 검토표</h3>
        <div className="tableScroll">
          <table>
            <thead>
              <tr><th>조항</th><th>등급</th><th>원문 요약</th><th>문제점</th><th>영향</th><th>수정 방향</th></tr>
            </thead>
            <tbody>
              {review.clauseReviews.map((item, index) => (
                <tr key={index}>
                  <td>{item.clause}</td>
                  <td><span className={gradeClass(item.grade)}>{item.grade}</span></td>
                  <td>{item.originalSummary}</td>
                  <td>{item.issue}</td>
                  <td>{item.impact}</td>
                  <td>{item.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>수정 전·후 비교</h3>
        <div className="revisionList">
          {review.revisions.map((item, index) => (
            <article key={index} className="revisionItem">
              <div className="revisionTitle"><span className={gradeClass(item.level)}>{item.level}</span><strong>수정안 {index + 1}</strong></div>
              <div className="diffGrid">
                <div><p className="label">기존 문구</p><pre className="oldText">{item.originalText}</pre></div>
                <div><p className="label">수정 문구</p><pre className="newText">{item.revisedText}</pre></div>
              </div>
              <p className="reason"><strong>수정 사유:</strong> {item.reason}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="grid twoCols">
        <div className="card">
          <h3>빠진 조항</h3>
          {review.missingClauses.map((item, index) => (
            <div key={index} className="missingBox">
              <strong>{item.title}</strong>
              <p>{item.whyNeeded}</p>
              <pre>{item.suggestedText}</pre>
            </div>
          ))}
        </div>
        <div className="card">
          <h3>상대방에게 확인할 질문</h3>
          <ol className="riskList">
            {review.questions.map((question, index) => <li key={index}>{question}</li>)}
          </ol>
        </div>
      </div>

      <div className="card">
        <h3>최종 행동계획</h3>
        <ol className="riskList">
          {review.finalActionPlan.map((action, index) => <li key={index}>{action}</li>)}
        </ol>
      </div>

      <div className="card reportBox">
        <h3>1페이지 보고서</h3>
        <p>{review.onePageReport}</p>
        <small>{review.meta.legalDisclaimer}</small>
      </div>
    </section>
  );
}
