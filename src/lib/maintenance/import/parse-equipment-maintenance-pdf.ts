import type { ParsedEquipmentMaintenanceFile, ParsedEquipmentMaintenanceRow } from "@/lib/maintenance/import/parse-equipment-maintenance-excel";

/**
 * Best-effort PDF parser for a recurring/equipment maintenance list.
 * PDFs don't preserve table columns, so this only reliably picks up one
 * system/location description per line — property, frequency, and last
 * completed date need a manual fill-in during review. Excel/CSV is far
 * more reliable for this kind of list.
 */
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

export async function parseEquipmentMaintenancePdfFile(file: File): Promise<ParsedEquipmentMaintenanceFile> {
  const lines = await extractPdfLines(file);
  const rows: ParsedEquipmentMaintenanceRow[] = lines
    .filter((l) => l.length > 3 && l.length < 200 && !/^(page|date)\b/i.test(l))
    .map((l) => ({ propertyName: "", location: "", systemType: l }));

  return {
    rows,
    warnings: [
      "PDF parsing is best-effort — only one description per line was detected as System Type. Fill in property, location, frequency, and last completed date manually below.",
    ],
  };
}
