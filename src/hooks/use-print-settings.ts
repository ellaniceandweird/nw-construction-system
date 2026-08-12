"use client";

import * as React from "react";

import {
  DEFAULT_PRINT_SETTINGS,
  loadPrintSettings,
  savePrintSettings,
  type PrintSettings,
} from "@/lib/print/settings";

export function usePrintSettings() {
  const [settings, setSettings] = React.useState<PrintSettings>(DEFAULT_PRINT_SETTINGS);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    setSettings(loadPrintSettings());
    setLoaded(true);
  }, []);

  const updateSettings = React.useCallback((next: Partial<PrintSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...next };
      savePrintSettings(merged);
      return merged;
    });
  }, []);

  return { settings, updateSettings, loaded };
}
