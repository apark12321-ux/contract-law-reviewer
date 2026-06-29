import JSZip from "jszip";

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
    throw new Error("현재 Vercel 안정 배포 버전에서는 PDF 직접 추출을 잠시 비활성화했습니다. DOCX, HWPX, TXT, MD로 변환해서 업로드하세요.");
  }

  if (name.endsWith(".hwpx")) {
    return extractHwpxText(buffer);
  }

  throw new Error("지원하지 않는 파일 형식입니다. DOCX, HWPX, TXT, MD 파일을 업로드하세요. HWP와 PDF는 DOCX 또는 TXT로 변환 후 업로드하세요.");
}
