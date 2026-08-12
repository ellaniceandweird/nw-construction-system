export type PaperSize = "letter" | "legal" | "a4" | "tabloid";
export type Orientation = "portrait" | "landscape";
export type ColorMode = "color" | "grayscale";

export interface PrintSettings {
  paperSize: PaperSize;
  orientation: Orientation;
  colorMode: ColorMode;
  /** Include the company header/logo on printed pages. */
  includeHeader: boolean;
}

export const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  paperSize: "letter",
  orientation: "landscape",
  colorMode: "color",
  includeHeader: true,
};

const STORAGE_KEY = "project-nw:print-settings";

const PAPER_SIZE_CSS: Record<PaperSize, string> = {
  letter: "letter",
  legal: "legal",
  a4: "A4",
  tabloid: "11in 17in",
};

export function loadPrintSettings(): PrintSettings {
  if (typeof window === "undefined") return DEFAULT_PRINT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PRINT_SETTINGS;
    return { ...DEFAULT_PRINT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PRINT_SETTINGS;
  }
}

export function savePrintSettings(settings: PrintSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

/**
 * Injects (or updates) a <style> tag that controls @page size/orientation
 * and grayscale color mode for the next print. Called right before
 * window.print() so every print button reflects the saved Settings.
 */
export function applyPrintSettingsToDocument(settings: PrintSettings) {
  if (typeof document === "undefined") return;

  const id = "project-nw-print-styles";
  let styleTag = document.getElementById(id) as HTMLStyleElement | null;
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = id;
    document.head.appendChild(styleTag);
  }

  const size = `${PAPER_SIZE_CSS[settings.paperSize]} ${settings.orientation}`;

  styleTag.textContent = `
    @media print {
      @page { size: ${size}; margin: 12mm; }
      html, body { ${settings.colorMode === "grayscale" ? "filter: grayscale(1);" : ""} }
      .print\\:hidden { display: none !important; }
    }
  `;
}
