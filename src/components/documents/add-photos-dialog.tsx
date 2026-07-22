"use client";
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DrivePickerButton } from "@/components/shared/drive-picker-button";
import { DriveUploadButton } from "@/components/shared/drive-upload-button";
import { useProperties } from "@/hooks/use-properties";
import { getPropertyForProject } from "@/lib/properties/property-relations";
import { createPhotos } from "@/lib/documents/photo-store";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import type { DrivePickedFile } from "@/lib/google-drive/use-drive-picker";
import type { PhotoCategory } from "@/types/field-operations";

interface Props { open: boolean; onOpenChange: (open: boolean) => void; }
const MANUAL_ENTRY = "__manual__";
const CATEGORY_OPTIONS: PhotoCategory[] = ["before_work", "during_work", "progress", "after_work", "quality", "safety", "deficiency", "delivery", "punch_list", "closeout"];

export function AddPhotosDialog({ open, onOpenChange }: Props) {
  const properties = useProperties();
  const [propertyId, setPropertyId] = React.useState("");
  const [propertyName, setPropertyName] = React.useState("");
  const [projectId, setProjectId] = React.useState("");
  const [projectName, setProjectName] = React.useState("");
  const [category, setCategory] = React.useState<PhotoCategory>("progress");
  const [added, setAdded] = React.useState(0);

  function reset() {
    setPropertyId(""); setPropertyName(""); setProjectId(""); setProjectName("");
    setCategory("progress"); setAdded(0);
  }

  function handlePropertyChange(value: string) {
    if (value === MANUAL_ENTRY) { setPropertyId(MANUAL_ENTRY); setPropertyName(""); return; }
    const property = properties.find((p) => p.id === value);
    setPropertyId(value);
    setPropertyName(property?.name ?? "");
  }
  function handleProjectChange(value: string) {
    if (value === MANUAL_ENTRY) { setProjectId(MANUAL_ENTRY); setProjectName(""); return; }
    setProjectId(value);
    setProjectName("");
    const proj = MOCK_PROJECTS.find((p) => p.id === value);
    const property = proj ? getPropertyForProject(proj, properties) : undefined;
    if (property) {
      setPropertyId(property.id);
      setPropertyName(property.name);
    }
  }

  function addOnePhoto(file: DrivePickedFile) {
    if (!projectId) return;
    createPhotos([{
      projectId,
      projectName: projectId === MANUAL_ENTRY ? projectName : undefined,
      propertyId: propertyId || undefined,
      propertyName: propertyId === MANUAL_ENTRY ? propertyName : undefined,
      dateTaken: new Date().toISOString().slice(0, 10),
      uploadedBy: "Ella Esquivel",
      caption: file.name,
      category,
      fileUrl: file.url,
      thumbnailUrl: file.thumbnailUrl,
    }]);
    setAdded((n) => n + 1);
  }

  function handleSelect(files: DrivePickedFile[]) {
    if (!projectId || files.length === 0) return;
    createPhotos(
      files.map((f) => ({
        projectId,
        projectName: projectId === MANUAL_ENTRY ? projectName : undefined,
        propertyId: propertyId || undefined,
        propertyName: propertyId === MANUAL_ENTRY ? propertyName : undefined,
        dateTaken: new Date().toISOString().slice(0, 10),
        uploadedBy: "Ella Esquivel",
        caption: f.name,
        category,
        fileUrl: f.url,
        thumbnailUrl: f.thumbnailUrl,
      }))
    );
    setAdded((n) => n + files.length);
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Photos</DialogTitle>
          <DialogDescription>Pick a property, project, and category, then upload photos from your computer or browse Google Drive.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Property</Label>
              <Select value={propertyId} onValueChange={handlePropertyChange}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select property" /></SelectTrigger>
                <SelectContent>
                  {properties.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                  <SelectItem value={MANUAL_ENTRY}>Manual entry…</SelectItem>
                </SelectContent>
              </Select>
              {propertyId === MANUAL_ENTRY && (
                <Input className="mt-2" placeholder="Type property name" value={propertyName} onChange={(e) => setPropertyName(e.target.value)} />
              )}
            </div>
            <div>
              <Label>Project</Label>
              <Select value={projectId} onValueChange={handleProjectChange}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {MOCK_PROJECTS.map((p) => (<SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>))}
                  <SelectItem value={MANUAL_ENTRY}>Manual entry…</SelectItem>
                </SelectContent>
              </Select>
              {projectId === MANUAL_ENTRY && (
                <Input className="mt-2" placeholder="Type project name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
              )}
            </div>
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
              <p className="text-xs text-muted-foreground">Select a project first.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <DriveUploadButton onUploaded={addOnePhoto} label="Upload Photos" accept="image/*" multiple />
                <DrivePickerButton onSelect={handleSelect} multiple imagesOnly label="Browse Google Drive Photos" />
              </div>
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
