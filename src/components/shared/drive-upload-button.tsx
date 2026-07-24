"use client";

import * as React from "react";
import { UploadCloud, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDrivePicker } from "@/lib/google-drive/use-drive-picker";
import type { DrivePickedFile } from "@/lib/google-drive/use-drive-picker";

interface Props {
  onUploaded: (file: DrivePickedFile) => void;
  label?: string;
  accept?: string;
  multiple?: boolean;
}

/**
 * Real upload flow: pick a file from your computer, then a Drive folder
 * picker opens so you choose where it lands, then it actually uploads
 * (not just linking to something already in Drive — see DrivePickerButton
 * for that). Needs the same Google Cloud setup as the browse picker,
 * plus the drive.file scope for writing. With `multiple`, each selected
 * file uploads into the same chosen folder and onUploaded fires once per file.
 */
export function DriveUploadButton({ onUploaded, label = "Upload to Google Drive", accept, multiple }: Props) {
  const { isConfigured, openPicker, uploadFile, loading, error } = useDrivePicker();
  const [showSetupHelp, setShowSetupHelp] = React.useState(false);
  const [stage, setStage] = React.useState<"idle" | "choosing_folder" | "uploading">("idle");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const pendingFilesRef = React.useRef<File[]>([]);

  function handleClick() {
    if (!isConfigured) {
      setShowSetupHelp(true);
      return;
    }
    fileInputRef.current?.click();
  }

  function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    pendingFilesRef.current = files;
    setStage("choosing_folder");
    openPicker(
      async (folders) => {
        const folder = folders[0];
        const filesToUpload = pendingFilesRef.current;
        setStage("uploading");
        try {
          for (const file of filesToUpload) {
            const uploaded = await uploadFile(file, folder?.id);
            onUploaded(uploaded);
          }
        } catch {
          // error state is already surfaced via the hook's `error`
        } finally {
          setStage("idle");
          pendingFilesRef.current = [];
        }
      },
      { foldersOnly: true }
    );
  }

  const busy = loading || stage !== "idle";
  const buttonText =
    stage === "choosing_folder" ? "Choose a folder…" : stage === "uploading" ? "Uploading…" : label;

  return (
    <div>
      <input ref={fileInputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={handleFileChosen} />
      <Button type="button" variant="outline" size="sm" onClick={handleClick} disabled={busy}>
        <UploadCloud className="size-3.5" /> {buttonText}
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
            Same setup as the Google Drive browse button — a Google Cloud project with the
            Drive API + Picker API enabled, and credentials in{" "}
            <code className="rounded bg-black/10 px-1">.env.local</code>. See
            .env.local.example. Until then, upload the file in Drive yourself and paste the
            link below.
          </p>
        </div>
      )}
    </div>
  );
}
