"use client";

import * as React from "react";
import { FolderOpen, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDrivePicker } from "@/lib/google-drive/use-drive-picker";
import type { DrivePickedFile } from "@/lib/google-drive/use-drive-picker";

interface Props {
  onSelect: (files: DrivePickedFile[]) => void;
  multiple?: boolean;
  imagesOnly?: boolean;
  foldersOnly?: boolean;
  label?: string;
}

export function DrivePickerButton({ onSelect, multiple, imagesOnly, foldersOnly, label }: Props) {
  const { isConfigured, openPicker, loading, error } = useDrivePicker();
  const [showSetupHelp, setShowSetupHelp] = React.useState(false);
  const buttonLabel = label ?? (foldersOnly ? "Link Google Drive Folder" : "Browse Google Drive");

  function handleClick() {
    if (!isConfigured) {
      setShowSetupHelp(true);
      return;
    }
    openPicker(onSelect, { multiple, imagesOnly, foldersOnly });
  }

  return (
    <div>
      <Button type="button" variant="outline" size="sm" onClick={handleClick} disabled={loading}>
        <FolderOpen className="size-3.5" /> {loading ? "Opening…" : buttonLabel}
      </Button>
      {error && (
        <p className="mt-1.5 flex items-start gap-1.5 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 size-3 shrink-0" /> {error}
        </p>
      )}
      {showSetupHelp && !isConfigured && (
        <div className="mt-2 rounded-lg bg-warning-soft p-3 text-xs text-warning-foreground">
          <p className="font-medium">Google Drive isn&apos;t connected yet</p>
          <p className="mt-1">
            This needs a Google Cloud project with the Drive API and Picker API enabled,
            plus an OAuth Client ID and API key set as{" "}
            <code className="rounded bg-black/10 px-1">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> and{" "}
            <code className="rounded bg-black/10 px-1">NEXT_PUBLIC_GOOGLE_API_KEY</code> in{" "}
            <code className="rounded bg-black/10 px-1">.env.local</code>. See the
            .env.local.example file for step-by-step setup. Until then, just paste the
            share link directly below.
          </p>
        </div>
      )}
    </div>
  );
}
