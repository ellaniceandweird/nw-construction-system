"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePrintSettings } from "@/hooks/use-print-settings";
import { applyPrintSettingsToDocument } from "@/lib/print/settings";

export function PrintButton({ label = "Print" }: { label?: string }) {
  const { settings } = usePrintSettings();

  function handlePrint() {
    applyPrintSettingsToDocument(settings);
    // Give the injected <style> a tick to attach before the print dialog opens.
    requestAnimationFrame(() => window.print());
  }

  return (
    <Button variant="outline" onClick={handlePrint} className="print:hidden">
      <Printer /> {label}
    </Button>
  );
}
