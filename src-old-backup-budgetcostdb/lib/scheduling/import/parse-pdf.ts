import { matchProjectName, parseDateFlexible } from "@/lib/scheduling/import/shared";
import type { ParsedActivityRow } from "@/lib/scheduling/import/shared";

// A date-like token: 7/10/2026, 07-10-2026, 2026-07-10, "Jul 10, 2026", etc.
const DATE_PATTERN =
  /(\d{1,2}\/\d{1,2}\/\d{2,4})|(\d{4}-\d{1,2}-\d{1,2})|([A-Za-z]{3,9}\.?\s+\d{1,2},?\s+\d{4})/g;

/**
 * Extracts likely schedule rows from a PDF's raw text.
 *
 * IMPORTANT HONEST LIMITATION: PDFs don't contain real table structure —
 * only positioned text. This looks for lines containing at least two
 * date-like tokens (a plausible start/finish pair) and treats the
 * remaining text on that line as the activity description. It does NOT
 * reliably detect which project a line belongs to (PDFs rarely repeat
 * that on every row), so matchedProjectId will usually be null here —
 * the person reviewing the import picks the project manually for each
 * row. This is meaningfully less reliable than the Excel path and should
 * be treated as a rough starting point, not an authoritative import.
 */
export async function parsePdfFile(file: File): Promise<ParsedActivityRow[]> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buffer }).promise;

  const lines: string[] = [];
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    // Group text items into rough lines by their vertical position
    const byY = new Map<number, string[]>();
    for (const item of content.items) {
      if (!("str" in item) || !item.str.trim()) continue;
      const y = Math.round(item.transform[5]);
      if (!byY.has(y)) byY.set(y, []);
      byY.get(y)!.push(item.str);
    }
    const sortedYs = [...byY.keys()].sort((a, b) => b - a);
    for (const y of sortedYs) {
      lines.push(byY.get(y)!.join(" ").trim());
    }
  }

  const results: ParsedActivityRow[] = [];
  let rowCounter = 0;
  let lastSeenProjectLike: string | null = null;

  for (const line of lines) {
    const dateMatches = [...line.matchAll(DATE_PATTERN)].map((m) => m[0]);

    if (dateMatches.length >= 2) {
      const start = parseDateFlexible(dateMatches[0]);
      const finish = parseDateFlexible(dateMatches[1]);
      // Strip the date tokens out to get the description text
      const description = line.replace(DATE_PATTERN, "").replace(/\s{2,}/g, " ").trim();
      if (!description) continue;

      const matchedProjectId = lastSeenProjectLike ? matchProjectName(lastSeenProjectLike) : null;

      const warnings: string[] = [];
      if (!matchedProjectId) warnings.push("Couldn't detect a project from the PDF — please select one");
      if (!start) warnings.push("Start date couldn't be read");
      if (!finish) warnings.push("Finish date couldn't be read");

      results.push({
        rowId: `pdf-import-${rowCounter++}`,
        projectNameRaw: lastSeenProjectLike ?? "",
        matchedProjectId,
        activityName: description,
        plannedStart: start,
        plannedFinish: finish,
        status: "not_started",
        include: false, // PDF rows always default OFF — person must actively opt in after review
        warnings,
      });
    } else if (line.length > 3 && line.length < 60 && dateMatches.length === 0) {
      // A short, date-free line is our best guess at a project/section header
      lastSeenProjectLike = line;
    }
  }

  return results;
}
