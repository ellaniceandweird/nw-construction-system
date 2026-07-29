"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updatePhoto, deletePhoto, restorePhoto } from "@/lib/documents/photo-store";
import { showErrorToast, showSuccessToast, showUndoToast } from "@/lib/toast/toast-store";
import type { FieldPhoto, PhotoCategory } from "@/types/field-operations";

interface Props {
  photo: FieldPhoto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORY_OPTIONS: PhotoCategory[] = [
  "before_work", "during_work", "progress", "after_work",
  "quality", "safety", "deficiency", "delivery", "punch_list", "closeout",
];

export function PhotoEditDialog({ photo, open, onOpenChange }: Props) {
  const [caption, setCaption] = React.useState("");
  const [category, setCategory] = React.useState<PhotoCategory>("progress");
  const [location, setLocation] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (photo && open) {
      setCaption(photo.caption ?? "");
      setCategory(photo.category);
      setLocation(photo.location ?? "");
      setTags((photo.tags ?? []).join(", "));
      setConfirmingDelete(false);
    }
  }, [photo, open]);

  async function handleSave() {
    if (!photo) return;
    setSaving(true);
    const result = await updatePhoto(photo.id, {
      projectId: photo.projectId,
      projectName: photo.projectName,
      propertyId: photo.propertyId,
      propertyName: photo.propertyName,
      activityId: photo.activityId,
      dateTaken: photo.dateTaken,
      uploadedBy: photo.uploadedBy,
      location: location || undefined,
      caption: caption || undefined,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      category,
      fileUrl: photo.fileUrl,
      thumbnailUrl: photo.thumbnailUrl,
    });
    setSaving(false);
    if (!result.ok) {
      showErrorToast(result.error ? `Couldn't save: ${result.error}` : "Couldn't save this photo — check your connection and try again.");
      return;
    }
    showSuccessToast("Photo updated");
    onOpenChange(false);
  }

  function handleDelete() {
    if (!photo) return;
    deletePhoto(photo.id);
    showUndoToast("Photo deleted", () => restorePhoto(photo));
    onOpenChange(false);
  }

  if (!photo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Photo</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <a href={photo.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
            Open original file
          </a>
          <div>
            <Label htmlFor="caption">Caption</Label>
            <Input id="caption" className="mt-1.5" value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as PhotoCategory)}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((c) => (<SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location (optional)</Label>
              <Input id="location" className="mt-1.5" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="tags">Tags (comma-separated, optional)</Label>
            <Input id="tags" className="mt-1.5" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. roof, exterior, before" />
          </div>
        </div>
        <DialogFooter className="justify-between">
          {confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete this photo?</span>
              <Button variant="destructive" size="sm" onClick={handleDelete}>Confirm Delete</Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmingDelete(true)}>
              <Trash2 className="size-3.5" /> Delete
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
