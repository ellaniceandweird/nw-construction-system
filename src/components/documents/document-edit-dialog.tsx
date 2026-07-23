"use client";
import * as React from "react";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createDocument, updateDocument, deleteDocument, restoreDocument } from "@/lib/documents/document-store";
import { showSuccessToast, showUndoToast } from "@/lib/toast/toast-store";
import { DrivePickerButton } from "@/components/shared/drive-picker-button";
import { DriveUploadButton } from "@/components/shared/drive-upload-button";
import { detectFileType } from "@/lib/documents/detect-file-type";
import { useProperties } from "@/hooks/use-properties";
import { getPropertyForProject } from "@/lib/properties/property-relations";
import type { DrivePickedFile } from "@/lib/google-drive/use-drive-picker";
import { useProjects } from "@/hooks/use-projects";
import type { ProjectDocument, DocumentCategory, DocumentStatus } from "@/types/documents";

interface Props { document: ProjectDocument | null; open: boolean; onOpenChange: (open: boolean) => void; }

const MANUAL_ENTRY = "__manual__";

const CATEGORY_OPTIONS: { value: DocumentCategory; label: string }[] = [
  { value: "architectural_drawing", label: "Architectural Drawing" },
  { value: "structural_drawing", label: "Structural Drawing" },
  { value: "shop_drawing", label: "Shop Drawing" },
  { value: "as_built_drawing", label: "As-Built Drawing" },
  { value: "specification", label: "Specification" },
  { value: "product_data", label: "Product Data" },
  { value: "material_certification", label: "Material Certification" },
  { value: "test_report", label: "Test Report" },
  { value: "rfi", label: "RFI" },
  { value: "submittal", label: "Submittal" },
  { value: "daily_report", label: "Daily Report" },
  { value: "inspection_report", label: "Inspection Report" },
  { value: "safety_report", label: "Safety Report" },
  { value: "contract", label: "Contract" },
  { value: "master_subcontract_agreement", label: "Master Subcontract Agreement" },
  { value: "purchase_order", label: "Purchase Order" },
  { value: "quotation", label: "Quotation" },
  { value: "change_order", label: "Change Order" },
  { value: "invoice", label: "Invoice" },
  { value: "punch_list", label: "Punch List" },
  { value: "warranty_certificate", label: "Warranty Certificate" },
  { value: "operation_manual", label: "Operation Manual" },
  { value: "maintenance_manual", label: "Maintenance Manual" },
  { value: "final_acceptance", label: "Final Acceptance" },
];
const STATUS_OPTIONS: { value: DocumentStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "internal_review", label: "Internal Review" },
  { value: "owner_review", label: "Owner Review" },
  { value: "approved", label: "Approved" },
  { value: "approved_with_comments", label: "Approved with Comments" },
  { value: "rejected", label: "Rejected" },
  { value: "superseded", label: "Superseded" },
  { value: "archived", label: "Archived" },
  { value: "expired", label: "Expired" },
];

export function DocumentEditDialog({ document, open, onOpenChange }: Props) {
  const projects = useProjects();
  const properties = useProperties();
  const [propertyId, setPropertyId] = React.useState("");
  const [propertyName, setPropertyName] = React.useState("");
  const [projectId, setProjectId] = React.useState("");
  const [projectName, setProjectName] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState<DocumentCategory>("contract");
  const [revision, setRevision] = React.useState("0");
  const [documentStatus, setDocumentStatus] = React.useState<DocumentStatus>("draft");
  const [author, setAuthor] = React.useState("");
  const [issueDate, setIssueDate] = React.useState("");
  const [fileType, setFileType] = React.useState("");
  const [fileUrl, setFileUrl] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [comments, setComments] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setPropertyId(document?.propertyId ?? "");
      setPropertyName(document?.propertyName ?? "");
      setProjectId(document?.projectId ?? "");
      setProjectName(document?.projectName ?? "");
      setTitle(document?.title ?? "");
      setCategory(document?.category ?? "contract");
      setRevision(document?.revision ?? "0");
      setDocumentStatus(document?.documentStatus ?? "draft");
      setAuthor(document?.author ?? "");
      setIssueDate(document?.issueDate ?? new Date().toISOString().slice(0, 10));
      setFileType(document?.fileType ?? "");
      setFileUrl(document?.fileUrl ?? "");
      setTags(document?.tags?.join(", ") ?? "");
      setComments(document?.comments ?? "");
      setConfirmingDelete(false);
    }
  }, [document, open]);

  function handleDriveSelect(files: DrivePickedFile[]) {
    const file = files[0];
    if (!file) return;
    setFileUrl(file.url);
    if (!title) setTitle(file.name);
    setFileType(detectFileType(file.name));
  }

  function handleDriveSelect1(file: DrivePickedFile) {
    setFileUrl(file.url);
    if (!title) setTitle(file.name);
    setFileType(detectFileType(file.name));
  }

  function handlePropertyChange(value: string) {
    if (value === MANUAL_ENTRY) {
      setPropertyId(MANUAL_ENTRY);
      setPropertyName("");
      return;
    }
    const property = properties.find((p) => p.id === value);
    setPropertyId(value);
    setPropertyName(property?.name ?? "");
  }

  function handleProjectChange(value: string) {
    if (value === MANUAL_ENTRY) {
      setProjectId(MANUAL_ENTRY);
      setProjectName("");
      return;
    }
    setProjectId(value);
    setProjectName("");
    const proj = projects.find((p) => p.id === value);
    const property = proj ? getPropertyForProject(proj, properties) : undefined;
    if (property) {
      setPropertyId(property.id);
      setPropertyName(property.name);
    }
  }

  function handleSave() {
    if (!projectId || !title || !fileUrl) return;
    const input = {
      projectId, projectName: projectId === MANUAL_ENTRY ? projectName : undefined,
      propertyId: propertyId || undefined,
      propertyName: propertyId === MANUAL_ENTRY ? propertyName : undefined,
      title, category, revision, documentStatus,
      author: author || undefined, issueDate: issueDate || undefined,
      fileType: fileType || "Other", fileUrl,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      comments: comments || undefined,
    };
    if (document) { updateDocument(document.id, input); } else { createDocument(input); }
    showSuccessToast(document ? "Document updated" : "Document added");
    onOpenChange(false);
  }
  function handleDelete() {
    if (!document) return;
    const removed = document;
    deleteDocument(document.id);
    showUndoToast("Document deleted", () => restoreDocument(removed));
    onOpenChange(false);
  }
  const canSave = !!projectId && !!title && !!fileUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{document ? `Edit ${document.documentNumber}` : "New Document"}</DialogTitle></DialogHeader>
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
                  {projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>))}
                  <SelectItem value={MANUAL_ENTRY}>Manual entry…</SelectItem>
                </SelectContent>
              </Select>
              {projectId === MANUAL_ENTRY && (
                <Input className="mt-2" placeholder="Type project name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
              )}
            </div>
          </div>
          <div><Label htmlFor="title">Title</Label><Input id="title" className="mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as DocumentCategory)}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORY_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={documentStatus} onValueChange={(v) => setDocumentStatus(v as DocumentStatus)}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label htmlFor="revision">Revision</Label><Input id="revision" className="mt-1.5" value={revision} onChange={(e) => setRevision(e.target.value)} /></div>
            <div><Label htmlFor="author">Author (optional)</Label><Input id="author" className="mt-1.5" value={author} onChange={(e) => setAuthor(e.target.value)} /></div>
            <div><Label htmlFor="issueDate">Issue Date</Label><Input id="issueDate" type="date" className="mt-1.5" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} /></div>
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label htmlFor="fileUrl">Upload / Link to File</Label>
              <div className="flex gap-2">
                <DriveUploadButton onUploaded={handleDriveSelect1} />
                <DrivePickerButton onSelect={handleDriveSelect} label="Link Existing File" />
              </div>
            </div>
            <Input id="fileUrl" placeholder="Google Drive, Dropbox, or shared drive link" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
            <p className="mt-1 text-xs text-muted-foreground">
              This is a document index, not file storage — &quot;Upload to Google Drive&quot; picks a file from
              your computer and a destination folder, then uploads it for real. &quot;Link Existing File&quot;
              picks something already in Drive instead. You can also just paste a link directly.
              {fileType && <> File type auto-detected as <span className="font-medium text-foreground">{fileType}</span>.</>}
            </p>
          </div>
          <div><Label htmlFor="tags">Tags (comma-separated, optional)</Label><Input id="tags" className="mt-1.5" value={tags} onChange={(e) => setTags(e.target.value)} /></div>
          <div><Label htmlFor="comments">Comments (optional)</Label><Textarea id="comments" className="mt-1.5" value={comments} onChange={(e) => setComments(e.target.value)} /></div>
        </div>
        <DialogFooter className="sm:justify-between">
          {document ? (confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete this document?</span>
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
