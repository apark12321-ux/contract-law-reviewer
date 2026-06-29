import { createRequire } from "node:module";
import JSZip from "jszip";

const requireFromModule = createRequire(import.meta.url);

function decodeXmlEntities(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function extractHwpxText(buffer: Buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const sectionFiles = Object.keys(zip.files)
    .filter((name) => /Contents\/section\d+\.xml$/i.test(name))
    .sort();

  const chunks: string[] = [];
  for (const name of sectionFiles) {
    const xml = await zip.files[name].async("string");
    const matches = Array.from(xml.matchAll(/<hp:t[^>]*>([\s\S]*?)<\/hp:t>/g));
    for (const match of matches) {
      const cleaned = decodeXmlEntities(match[1].replace(/<[^>]+>/g, "").trim());
      if (cleaned) chunks.push(cleaned);
    }
  }
  return chunks.join("\n");
}

type PdfParse = (data: Buffer) => Promise<{ text: string }>;

export async function extractTextFromFile(file: File) {
  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (name.endsWith(".txt") || name.endsWith(".md")) {
    return new TextDecoder("utf-8").decode(buffer);
  }

  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (name.endsWith(".pdf")) {
    const pdfParse = requireFromModule("pdf-parse") as PdfParse;
    const result = await pdfParse(buffer);
    return result.text;
  }

  if (name.endsWith(".hwpx")) {
    return extractHwpxText(buffer);
  }

  throw new Error("지원하지 않는 파일 형식입니다. PDF, DOCX, HWPX, TXT, MD 파일을 업로드하세요. HWP 파일은 PDF 또는 HWPX로 변환 후 업로드하세요.");
}
