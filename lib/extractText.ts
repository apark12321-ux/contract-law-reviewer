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

type PdfTextItem = { str?: string };
type PdfPage = { getTextContent: () => Promise<{ items: PdfTextItem[] }> };
type PdfDocument = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPage>;
  destroy?: () => Promise<void> | void;
};
type PdfJsModule = {
  getDocument: (source: { data: Uint8Array; disableWorker: boolean }) => { promise: Promise<PdfDocument> };
};

async function extractPdfText(buffer: Buffer) {
  const pdfjsPath = "pdfjs-dist/legacy/build/pdf.mjs";
  const pdfjs = (await import(pdfjsPath)) as PdfJsModule;
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer), disableWorker: true });
  const pdf = await loadingTask.promise;
  const pages: string[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str || "").join(" ").trim();
      if (pageText) pages.push(pageText);
    }
  } finally {
    await pdf.destroy?.();
  }

  return pages.join("\n\n");
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
    return extractPdfText(buffer);
  }

  if (name.endsWith(".hwpx")) {
    return extractHwpxText(buffer);
  }

  throw new Error("지원하지 않는 파일 형식입니다. PDF, DOCX, HWPX, TXT, MD 파일을 업로드하세요. HWP 파일은 PDF 또는 HWPX로 변환 후 업로드하세요.");
}
