"use client";

import { Printer } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePrintSettings } from "@/hooks/use-print-settings";
import type { PaperSize, Orientation, ColorMode } from "@/lib/print/settings";

export function PrintSettingsCard() {
  const { settings, updateSettings, loaded } = usePrintSettings();

  if (!loaded) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Printer className="size-4" /> Print Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label>Paper Size</Label>
          <Select
            value={settings.paperSize}
            onValueChange={(v) => updateSettings({ paperSize: v as PaperSize })}
          >
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="letter">Letter (8.5 × 11 in)</SelectItem>
              <SelectItem value="legal">Legal (8.5 × 14 in)</SelectItem>
              <SelectItem value="tabloid">Tabloid (11 × 17 in)</SelectItem>
              <SelectItem value="a4">A4</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Orientation</Label>
          <Select
            value={settings.orientation}
            onValueChange={(v) => updateSettings({ orientation: v as Orientation })}
          >
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="portrait">Portrait</SelectItem>
              <SelectItem value="landscape">Landscape</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Color Mode</Label>
          <Select
            value={settings.colorMode}
            onValueChange={(v) => updateSettings({ colorMode: v as ColorMode })}
          >
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="color">Full Color</SelectItem>
              <SelectItem value="grayscale">Grayscale (save ink)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="sm:col-span-3 text-xs text-muted-foreground">
          These settings apply the next time anyone clicks a Print button anywhere in
          the app — including all 5 Scheduling views. Saved on this device.
        </p>
      </CardContent>
    </Card>
  );
}
