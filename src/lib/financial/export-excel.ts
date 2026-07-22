import * as XLSX from "xlsx";

/**
 * Exports an array of plain objects to a downloaded .xlsx file. Uses a
 * Blob + temporary link instead of XLSX.writeFile, since writeFile's
 * browser download path is less reliable across browsers than a plain
 * anchor download.
 */
export function exportToExcel(filename: string, sheetName: string, rows: Record<string, unknown>[]) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], { type: "application/octet-stream" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
