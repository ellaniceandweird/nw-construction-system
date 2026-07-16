"use client";
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DrivePickerButton } from "@/components/shared/drive-picker-button";
import { createPhotos } from "@/lib/documents/photo-store";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import type { DrivePickedFile } from "@/lib/google-drive/use-drive-picker";
import type { PhotoCategory } from "@/types/field-operations";

interface Props { open: boolean; onOpenChange: (open: boolean) => void; }
const CATEGORY_OPTIONS: PhotoCategory[] = ["before_work", "during_work", "progress", "after_work", "quality", "safety", "deficiency", "delivery", "punch_list", "closeout"];

export function AddPhotosDialog({ open, onOpenChange }: Props) {
  const [projectId, setProjectId] = React.useState("");
  const [category, setCategory] = React.useState<PhotoCategory>("progress");
  const [added, setAdded] = React.useState(0);

  function reset() { setProjectId(""); setCategory("progress"); setAdded(0); }

  function handleSelect(files: DrivePickedFile[]) {
    if (!projectId || files.length === 0) return;
    createPhotos(
      files.map((f) => ({
        projectId,
        dateTaken: new Date().toISOString().slice(0, 10),
        uploadedBy: "Ella Esquivel",
        caption: f.name,
        category,
        fileUrl: f.url,
        thumbnailUrl: f.thumbnailUrl,
      }))
    );
    setAdded(files.length);
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Photos</DialogTitle>
          <DialogDescription>Pick a property and category, then browse Google Drive to select photos — no manual entry needed.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label>Property</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>{MOCK_PROJECTS.map((p) => (<SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as PhotoCategory)}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORY_OPTIONS.map((c) => (<SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div>
            {!projectId ? (
              <p className="text-xs text-muted-foreground">Select a property first.</p>
            ) : (
              <DrivePickerButton onSelect={handleSelect} multiple imagesOnly label="Browse Google Drive Photos" />
            )}
          </div>
          {added > 0 && <p className="text-sm text-success">Added {added} photo{added === 1 ? "" : "s"}.</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
