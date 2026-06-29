"use client";

import { FormEvent, useMemo, useState } from "react";
import ReviewResult from "./components/ReviewResult";
import type { ContractReview } from "@/lib/schema";

type ApiResponse = {
  result?: ContractReview;
  extractedChars?: number;
  error?: string;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [contractType, setContractType] = useState("용역계약서");
  const [userPosition, setUserPosition] = useState("을 / 수행자 / 자문자");
  const [counterpartyPosition, setCounterpartyPosition] = useState("갑 / 발주자 / 의뢰자");
  const [reviewFocus, setReviewFocus] = useState("업무범위, 대금 지급, 중도해지, 손해배상, 산출물·저작권 귀속, 비밀유지, 관할법원을 중점 검토");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [review, setReview] = useState<ContractReview | null>(null);
  const [extractedChars, setExtractedChars] = useState<number | null>(null);

  const fileLabel = useMemo(() => {
    if (!file) return "PDF, DOCX, HWPX, TXT, MD 파일 업로드";
    return `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)}MB`;
  }, [file]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setReview(null);
    setExtractedChars(null);

    if (!file) {
      setError("분석할 계약서 파일을 먼저 업로드하세요.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("contractType", contractType);
    formData.append("userPosition", userPosition);
    formData.append("counterpartyPosition", counterpartyPosition);
    formData.append("reviewFocus", reviewFocus);

    setLoading(true);
    try {
      const response = await fetch("/api/analyze", { method: "POST", body: formData });
      const data: ApiResponse = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || "분석 요청에 실패했습니다.");
      if (!data.result) throw new Error("분석 결과가 비어 있습니다.");
      setReview(data.result);
      setExtractedChars(data.extractedChars || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="hero">
        <div className="heroText">
          <p className="eyebrow">Contract Legal Review AI</p>
          <h1>계약서 초안 업로드 → 법무 리스크 분석 → 수정안 도출</h1>
          <p>Gemini, Claude, ChatGPT 등으로 만든 계약서 초안을 올리면 그대로 가도 되는 부분과 수정해야 할 부분을 시각적으로 구분합니다.</p>
        </div>
        <div className="legend card">
          <h3>검토 등급</h3>
          <span className="badge safe">🟢 그대로 가능</span>
          <span className="badge check">🟡 확인 필요</span>
          <span className="badge negotiate">🟠 협상 권장</span>
          <span className="badge danger">🔴 수정 필수</span>
          <span className="badge missing">⚫ 누락 조항</span>
        </div>
      </section>

      <section className="card uploadCard">
        <form onSubmit={handleSubmit}>
          <div className="uploadBox">
            <label htmlFor="contractFile">계약서 파일</label>
            <input
              id="contractFile"
              type="file"
              accept=".pdf,.docx,.hwpx,.txt,.md"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
            <p>{fileLabel}</p>
            <small>HWP 파일은 PDF 또는 HWPX로 변환 후 업로드하세요. 스캔 PDF는 OCR 처리 후 업로드해야 정확합니다.</small>
          </div>

          <div className="formGrid">
            <label>계약서 종류<input value={contractType} onChange={(e) => setContractType(e.target.value)} placeholder="예: 자문계약서" /></label>
            <label>우리 측 지위<input value={userPosition} onChange={(e) => setUserPosition(e.target.value)} placeholder="예: 을 / 수행자" /></label>
            <label>상대방 지위<input value={counterpartyPosition} onChange={(e) => setCounterpartyPosition(e.target.value)} placeholder="예: 갑 / 발주자" /></label>
            <label>중점 검토사항<textarea value={reviewFocus} onChange={(e) => setReviewFocus(e.target.value)} rows={4} /></label>
          </div>

          <button className="primary" type="submit" disabled={loading}>{loading ? "계약서 분석 중..." : "계약서 분석하기"}</button>
        </form>
      </section>

      {error && <div className="errorBox">{error}</div>}
      {extractedChars && <p className="extractInfo">추출된 문서 텍스트: {extractedChars.toLocaleString()}자</p>}
      {review && <ReviewResult review={review} />}
    </main>
  );
}
