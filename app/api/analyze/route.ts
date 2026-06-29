import { contractReviewSchema } from "@/lib/schema";
import { extractTextFromFile } from "@/lib/extractText";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

type OpenAIOutputPart = { type?: string; text?: string };
type OpenAIOutputItem = { content?: OpenAIOutputPart[] };
type OpenAIResponse = { output_text?: string; output?: OpenAIOutputItem[]; error?: { message?: string } };

function getOutputText(data: OpenAIResponse) {
  if (typeof data.output_text === "string") return data.output_text;
  for (const item of data.output || []) {
    for (const part of item.content || []) {
      if (part.type === "output_text" && typeof part.text === "string") return part.text;
    }
  }
  return "";
}

async function analyzeContract(args: {
  documentName: string;
  contractType: string;
  userPosition: string;
  counterpartyPosition: string;
  reviewFocus: string;
  extractedText: string;
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY 환경변수가 설정되어 있지 않습니다.");

  const model = process.env.OPENAI_MODEL || "gpt-5.5";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: [
        { role: "system", content: [{ type: "input_text", text: buildSystemPrompt() }] },
        { role: "user", content: [{ type: "input_text", text: buildUserPrompt(args) }] }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "contract_review_result",
          strict: true,
          schema: contractReviewSchema
        }
      }
    })
  });

  const data = (await response.json()) as OpenAIResponse;
  if (!response.ok) throw new Error(data.error?.message || "OpenAI API 요청에 실패했습니다.");

  const outputText = getOutputText(data);
  if (!outputText) throw new Error("분석 결과를 읽지 못했습니다. 모델 응답 형식을 확인하세요.");

  try {
    return JSON.parse(outputText) as unknown;
  } catch {
    throw new Error("분석 결과 JSON 파싱에 실패했습니다.");
  }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "계약서 파일이 없습니다." }, { status: 400 });
    }

    const maxFileSize = 10 * 1024 * 1024;
    if (file.size > maxFileSize) {
      return Response.json({ error: "파일 용량은 10MB 이하로 업로드하세요." }, { status: 400 });
    }

    const extractedText = await extractTextFromFile(file);
    if (!extractedText || extractedText.trim().length < 100) {
      return Response.json(
        { error: "문서에서 충분한 텍스트를 추출하지 못했습니다. 스캔 PDF라면 OCR 후 다시 업로드하세요." },
        { status: 400 }
      );
    }

    const result = await analyzeContract({
      documentName: file.name,
      contractType: String(form.get("contractType") || ""),
      userPosition: String(form.get("userPosition") || ""),
      counterpartyPosition: String(form.get("counterpartyPosition") || ""),
      reviewFocus: String(form.get("reviewFocus") || ""),
      extractedText
    });

    return Response.json({ result, extractedChars: extractedText.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return Response.json({ error: message }, { status: 500 });
  }
}
