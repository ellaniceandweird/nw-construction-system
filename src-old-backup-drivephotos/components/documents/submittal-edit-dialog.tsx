"use client";
import * as React from "react";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createSubmittal, updateSubmittal, deleteSubmittal } from "@/lib/documents/submittal-store";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { MOCK_VENDORS } from "@/lib/data/mock/vendors";
import type { Submittal, SubmittalStatus } from "@/types/documents";

interface Props { submittal: Submittal | null; open: boolean; onOpenChange: (open: boolean) => void; }
const STATUS_OPTIONS: SubmittalStatus[] = ["pending", "submitted", "approved", "approved_as_noted", "revise_and_resubmit", "rejected", "closed"];
const NONE = "none";

export function SubmittalEditDialog({ submittal, open, onOpenChange }: Props) {
  const [projectId, setProjectId] = React.useState("");
  const [specificationSection, setSpecificationSection] = React.useState("");
  const [material, setMaterial] = React.useState("");
  const [vendorId, setVendorId] = React.useState(NONE);
  const [submittedBy, setSubmittedBy] = React.useState("");
  const [submissionDate, setSubmissionDate] = React.useState("");
  const [requiredDate, setRequiredDate] = React.useState("");
  const [submittalStatus, setSubmittalStatus] = React.useState<SubmittalStatus>("pending");
  const [comments, setComments] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setProjectId(submittal?.projectId ?? "");
      setSpecificationSection(submittal?.specificationSection ?? "");
      setMaterial(submittal?.material ?? "");
      setVendorId(submittal?.vendorId ?? NONE);
      setSubmittedBy(submittal?.submittedBy ?? "");
      setSubmissionDate(submittal?.submissionDate ?? new Date().toISOString().slice(0, 10));
      setRequiredDate(submittal?.requiredDate ?? "");
      setSubmittalStatus(submittal?.submittalStatus ?? "pending");
      setComments(submittal?.comments ?? "");
      setConfirmingDelete(false);
    }
  }, [submittal, open]);

  function handleSave() {
    if (!projectId || !material || !submittedBy) return;
    const vendor = vendorId === NONE ? undefined : MOCK_VENDORS.find((v) => v.id === vendorId);
    const input = {
      projectId, specificationSection: specificationSection || undefined, material,
      manufacturer: vendor?.vendorName, vendorId: vendorId === NONE ? undefined : vendorId,
      submittedBy, submissionDate, requiredDate: requiredDate || undefined,
      returnedDate: submittalStatus === "approved" || submittalStatus === "approved_as_noted" ? (submittal?.returnedDate ?? new Date().toISOString().slice(0, 10)) : undefined,
      submittalStatus, comments: comments || undefined,
    };
    if (submittal) { updateSubmittal(submittal.id, input); } else { createSubmittal(input); }
    onOpenChange(false);
  }
  function handleDelete() { if (!submittal) return; deleteSubmittal(submittal.id); onOpenChange(false); }
  const canSave = !!projectId && !!material && !!submittedBy;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{submittal ? `Edit ${submittal.submittalNumber}` : "New Submittal"}</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label>Property</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>{MOCK_PROJECTS.map((p) => (<SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div><Label htmlFor="material">Material / Product</Label><Input id="material" className="mt-1.5" value={material} onChange={(e) => setMaterial(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="specificationSection">Cost Code (optional)</Label><Input id="specificationSection" className="mt-1.5" value={specificationSection} onChange={(e) => setSpecificationSection(e.target.value)} /></div>
            <div>
              <Label>Vendor (optional)</Label>
              <Select value={vendorId} onValueChange={setVendorId}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {MOCK_VENDORS.map((v) => (<SelectItem key={v.id} value={v.id}>{v.vendorName}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label htmlFor="submittedBy">Submitted By</Label><Input id="submittedBy" className="mt-1.5" value={submittedBy} onChange={(e) => setSubmittedBy(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="submissionDate">Submission Date</Label><Input id="submissionDate" type="date" className="mt-1.5" value={submissionDate} onChange={(e) => setSubmissionDate(e.target.value)} /></div>
            <div><Label htmlFor="requiredDate">Required By (optional)</Label><Input id="requiredDate" type="date" className="mt-1.5" value={requiredDate} onChange={(e) => setRequiredDate(e.target.value)} /></div>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={submittalStatus} onValueChange={(v) => setSubmittalStatus(v as SubmittalStatus)}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUS_OPTIONS.map((s) => (<SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div><Label htmlFor="comments">Comments (optional)</Label><Textarea id="comments" className="mt-1.5" value={comments} onChange={(e) => setComments(e.target.value)} /></div>
        </div>
        <DialogFooter className="sm:justify-between">
          {submittal ? (confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete this submittal?</span>
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
