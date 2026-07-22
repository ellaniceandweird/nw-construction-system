const EXTENSION_MAP: Record<string, string> = {
  pdf: "PDF",
  doc: "Word",
  docx: "Word",
  xls: "Excel",
  xlsx: "Excel",
  csv: "Excel",
  ppt: "PowerPoint",
  pptx: "PowerPoint",
  jpg: "Image",
  jpeg: "Image",
  png: "Image",
  gif: "Image",
  heic: "Image",
  webp: "Image",
  dwg: "CAD Drawing",
  dxf: "CAD Drawing",
  txt: "Text",
};

/** Detects a friendly file type label (PDF, Word, Excel, Image, etc.) from a filename. */
export function detectFileType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_MAP[ext] ?? (ext ? ext.toUpperCase() : "Other");
}
