import type { ParsedHolidaysFile, ParsedHolidayRow } from "@/lib/references/import/parse-holidays-excel";

async function extractPdfLines(file: File): Promise<string[]> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  const buffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
  const lines: string[] = [];
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const byY = new Map<number, string[]>();
    for (const item of content.items) {
      if (!("str" in item) || !item.str.trim()) continue;
      const y = Math.round(item.transform[5]);
      if (!byY.has(y)) byY.set(y, []);
      byY.get(y)!.push(item.str);
    }
    const sortedYs = [...byY.keys()].sort((a, b) => b - a);
    for (const y of sortedYs) lines.push(byY.get(y)!.join(" ").trim());
  }
  return lines.filter((l) => l.length > 0);
}

/** Best-effort — looks for a date (mm/dd/yyyy or Month Day, Year) anywhere in each line. */
export async function parseHolidaysPdfFile(file: File): Promise<ParsedHolidaysFile> {
  const lines = await extractPdfLines(file);
  const rows: ParsedHolidayRow[] = [];

  for (const line of lines) {
    const isoMatch = line.match(/(\d{4})-(\d{2})-(\d{2})/);
    const usMatch = line.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    const monthMatch = line.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i);

    let date = "";
    if (isoMatch) date = `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    else if (usMatch) date = `${usMatch[3]}-${usMatch[1].padStart(2, "0")}-${usMatch[2].padStart(2, "0")}`;
    else if (monthMatch) {
      const parsed = new Date(`${monthMatch[1]} ${monthMatch[2]}, ${monthMatch[3]}`);
      if (!Number.isNaN(parsed.getTime())) date = parsed.toISOString().slice(0, 10);
    }
    if (!date) continue;

    const name = line
      .replace(isoMatch?.[0] ?? "", "")
      .replace(usMatch?.[0] ?? "", "")
      .replace(monthMatch?.[0] ?? "", "")
      .replace(/[-:,]\s*$/, "")
      .trim();
    if (!name) continue;

    rows.push({ name, date });
  }

  return {
    rows,
    warnings: ["PDF parsing is best-effort — only lines with a recognizable date were picked up. Review every row before saving."],
  };
}
