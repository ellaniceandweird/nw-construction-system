import * as XLSX from "xlsx";

import { formatNowInNewYork } from "@/lib/date/today";
import type { Activity } from "@/types/scheduling";

export interface MasterScheduleExportGroup {
  projectName: string;
  activities: Activity[];
}

function formatDate(d?: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Exports the Master Schedule to a downloaded .xlsx file with a
 * professional Nice & Weird Group header (company name, report title,
 * generated timestamp) above the real data — built with aoa_to_sheet
 * (array-of-arrays) rather than json_to_sheet, since only that form
 * lets header rows, merged cells, and basic cell styling coexist with
 * the actual data below.
 */
export function exportMasterScheduleExcel(groups: MasterScheduleExportGroup[]) {
  const headerRows: (string | number)[][] = [
    ["Nice & Weird Group"],
    ["Master Schedule"],
    [`Generated ${formatNowInNewYork()}`],
    [],
    ["Project", "Activity", "Planned Start", "Planned Finish", "Duration (days)", "Manpower", "% Complete", "Status", "Critical"],
  ];

  const dataRows: (string | number)[][] = [];
  for (const group of groups) {
    for (const a of group.activities) {
      dataRows.push([
        group.projectName,
        a.name,
        formatDate(a.plannedStart),
        formatDate(a.plannedFinish),
        a.originalDurationDays,
        a.requiredManpower ?? "",
        a.percentComplete,
        a.status.replace(/_/g, " "),
        a.isCritical ? "Yes" : "",
      ]);
    }
  }

  const allRows = [...headerRows, ...dataRows];
  const worksheet = XLSX.utils.aoa_to_sheet(allRows);

  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } },
  ];

  const boldCells = ["A1", "A2", "A3", "A5", "B5", "C5", "D5", "E5", "F5", "G5", "H5", "I5"];
  for (const cellRef of boldCells) {
    if (worksheet[cellRef]) {
      worksheet[cellRef].s = { font: { bold: true, sz: cellRef === "A1" ? 14 : cellRef === "A2" ? 12 : 11 } };
    }
  }

  worksheet["!cols"] = [
    { wch: 26 },
    { wch: 32 },
    { wch: 13 },
    { wch: 13 },
    { wch: 14 },
    { wch: 10 },
    { wch: 11 },
    { wch: 14 },
    { wch: 9 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Master Schedule");

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array", cellStyles: true });
  const blob = new Blob([buffer], { type: "application/octet-stream" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Master Schedule ${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
