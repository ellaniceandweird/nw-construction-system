"use client";
import * as React from "react";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createDrawing, updateDrawing, deleteDrawing } from "@/lib/documents/drawing-store";
import { DrivePickerButton } from "@/components/shared/drive-picker-button";
import { DriveUploadButton } from "@/components/shared/drive-upload-button";
import { useProperties } from "@/hooks/use-properties";
import type { DrivePickedFile } from "@/lib/google-drive/use-drive-picker";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import type { Drawing, DrawingDiscipline, DocumentStatus } from "@/types/documents";

interface Props { drawing: Drawing | null; open: boolean; onOpenChange: (open: boolean) => void; }
const MANUAL_ENTRY = "__manual__";
const DISCIPLINE_OPTIONS: DrawingDiscipline[] = ["architectural", "structural", "civil", "mechanical", "electrical", "plumbing", "fire_protection", "landscape", "interior_design", "survey"];
const STATUS_OPTIONS: { value: DocumentStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "internal_review", label: "Internal Review" },
  { value: "owner_review", label: "Owner Review" },
  { value: "approved", label: "Approved" },
  { value: "approved_with_comments", label: "Approved with Comments" },
  { value: "rejected", label: "Rejected" },
  { value: "superseded", label: "Superseded" },
  { value: "archived", label: "Archived" },
];

export function DrawingEditDialog({ drawing, open, onOpenChange }: Props) {
  const properties = useProperties();
  const [propertyId, setPropertyId] = React.useState("");
  const [propertyName, setPropertyName] = React.useState("");
  const [projectId, setProjectId] = React.useState("");
  const [projectName, setProjectName] = React.useState("");
  const [drawingNumber, setDrawingNumber] = React.useState("");
  const [drawingTitle, setDrawingTitle] = React.useState("");
  const [discipline, setDiscipline] = React.useState<DrawingDiscipline>("architectural");
  const [sheetNumber, setSheetNumber] = React.useState("");
  const [revision, setRevision] = React.useState("0");
  const [scale, setScale] = React.useState("");
  const [issueDate, setIssueDate] = React.useState("");
  const [currentRevisionUrl, setCurrentRevisionUrl] = React.useState("");
  const [drawingStatus, setDrawingStatus] = React.useState<DocumentStatus>("draft");
  const [architect, setArchitect] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setPropertyId(drawing?.propertyId ?? "");
      setPropertyName(drawing?.propertyName ?? "");
      setProjectId(drawing?.projectId ?? "");
      setProjectName(drawing?.projectName ?? "");
      setDrawingNumber(drawing?.drawingNumber ?? "");
      setDrawingTitle(drawing?.drawingTitle ?? "");
      setDiscipline(drawing?.discipline ?? "architectural");
      setSheetNumber(drawing?.sheetNumber ?? "");
      setRevision(drawing?.revision ?? "0");
      setScale(drawing?.scale ?? "");
      setIssueDate(drawing?.issueDate ?? new Date().toISOString().slice(0, 10));
      setCurrentRevisionUrl(drawing?.currentRevisionUrl ?? "");
      setDrawingStatus(drawing?.drawingStatus ?? "draft");
      setArchitect(drawing?.architect ?? "");
      setConfirmingDelete(false);
    }
  }, [drawing, open]);

  function handleDriveSelect(files: DrivePickedFile[]) {
    const file = files[0];
    if (!file) return;
    setCurrentRevisionUrl(file.url);
    if (!drawingTitle) setDrawingTitle(file.name);
  }
  function handleUploaded(file: DrivePickedFile) {
    setCurrentRevisionUrl(file.url);
    if (!drawingTitle) setDrawingTitle(file.name);
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
  }

  function handleSave() {
    if (!projectId || !drawingNumber || !drawingTitle || !currentRevisionUrl) return;
    const input = {
      projectId, projectName: projectId === MANUAL_ENTRY ? projectName : undefined,
      propertyId: propertyId || undefined,
      propertyName: propertyId === MANUAL_ENTRY ? propertyName : undefined,
      drawingNumber, drawingTitle, discipline,
      sheetNumber: sheetNumber || undefined, revision, scale: scale || undefined,
      issueDate, currentRevisionUrl, drawingStatus, architect: architect || undefined,
      uploadedBy: drawing?.uploadedBy ?? "Ella Esquivel",
    };
    if (drawing) { updateDrawing(drawing.id, input); } else { createDrawing(input); }
    onOpenChange(false);
  }
  function handleDelete() { if (!drawing) return; deleteDrawing(drawing.id); onOpenChange(false); }
  const canSave = !!projectId && !!drawingNumber && !!drawingTitle && !!currentRevisionUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{drawing ? `Edit ${drawing.drawingNumber}` : "New Drawing"}</DialogTitle></DialogHeader>
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
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="drawingNumber">Drawing Number</Label><Input id="drawingNumber" className="mt-1.5" placeholder="e.g. A-101" value={drawingNumber} onChange={(e) => setDrawingNumber(e.target.value)} /></div>
            <div>
              <Label>Discipline</Label>
              <Select value={discipline} onValueChange={(v) => setDiscipline(v as DrawingDiscipline)}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{DISCIPLINE_OPTIONS.map((d) => (<SelectItem key={d} value={d}>{d.replace(/_/g, " ")}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label htmlFor="drawingTitle">Title</Label><Input id="drawingTitle" className="mt-1.5" value={drawingTitle} onChange={(e) => setDrawingTitle(e.target.value)} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label htmlFor="sheetNumber">Sheet # (optional)</Label><Input id="sheetNumber" className="mt-1.5" value={sheetNumber} onChange={(e) => setSheetNumber(e.target.value)} /></div>
            <div><Label htmlFor="revision">Revision</Label><Input id="revision" className="mt-1.5" value={revision} onChange={(e) => setRevision(e.target.value)} /></div>
            <div><Label htmlFor="scale">Scale (optional)</Label><Input id="scale" className="mt-1.5" placeholder="1/4&quot; = 1'-0&quot;" value={scale} onChange={(e) => setScale(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="issueDate">Issue Date</Label><Input id="issueDate" type="date" className="mt-1.5" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} /></div>
            <div>
              <Label>Status</Label>
              <Select value={drawingStatus} onValueChange={(v) => setDrawingStatus(v as DocumentStatus)}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label htmlFor="architect">Architect / Engineer (optional)</Label><Input id="architect" className="mt-1.5" value={architect} onChange={(e) => setArchitect(e.target.value)} /></div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label htmlFor="currentRevisionUrl">Upload / Link to Current Revision</Label>
              <div className="flex gap-2">
                <DriveUploadButton onUploaded={handleUploaded} />
                <DrivePickerButton onSelect={handleDriveSelect} label="Link Existing File" />
              </div>
            </div>
            <Input id="currentRevisionUrl" placeholder="Google Drive, Dropbox, or shared drive link" value={currentRevisionUrl} onChange={(e) => setCurrentRevisionUrl(e.target.value)} />
            {drawing && drawing.revision !== revision && (
              <p className="mt-1 text-xs text-warning-foreground">Changing the revision will archive the current link under previous revisions.</p>
            )}
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          {drawing ? (confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete this drawing?</span>
              <Button variant="destructive" size="sm" onClick={handleDelete}>Confirm Delete</Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmingDelete(true)}><Trash2 className="size-3.5" /> Delete</Button>
          )) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!canSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
