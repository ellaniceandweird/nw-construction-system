"use client";
import * as React from "react";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createRfi, updateRfi, deleteRfi } from "@/lib/documents/rfi-store";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import type { RFI, RfiStatus } from "@/types/documents";

interface Props { rfi: RFI | null; open: boolean; onOpenChange: (open: boolean) => void; }
const PRIORITY_OPTIONS: RFI["priority"][] = ["low", "medium", "high", "critical"];
const STATUS_OPTIONS: RfiStatus[] = ["draft", "submitted", "under_review", "answered", "closed", "cancelled"];

export function RfiEditDialog({ rfi, open, onOpenChange }: Props) {
  const [projectId, setProjectId] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [question, setQuestion] = React.useState("");
  const [requestedBy, setRequestedBy] = React.useState("");
  const [assignedTo, setAssignedTo] = React.useState("");
  const [priority, setPriority] = React.useState<RFI["priority"]>("medium");
  const [dateSubmitted, setDateSubmitted] = React.useState("");
  const [requiredResponseDate, setRequiredResponseDate] = React.useState("");
  const [rfiStatus, setRfiStatus] = React.useState<RfiStatus>("draft");
  const [answer, setAnswer] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setProjectId(rfi?.projectId ?? "");
      setSubject(rfi?.subject ?? "");
      setDescription(rfi?.description ?? "");
      setQuestion(rfi?.question ?? "");
      setRequestedBy(rfi?.requestedBy ?? "");
      setAssignedTo(rfi?.assignedTo ?? "");
      setPriority(rfi?.priority ?? "medium");
      setDateSubmitted(rfi?.dateSubmitted ?? new Date().toISOString().slice(0, 10));
      setRequiredResponseDate(rfi?.requiredResponseDate ?? "");
      setRfiStatus(rfi?.rfiStatus ?? "draft");
      setAnswer(rfi?.answer ?? "");
      setConfirmingDelete(false);
    }
  }, [rfi, open]);

  function handleSave() {
    if (!projectId || !subject || !question || !requestedBy || !requiredResponseDate) return;
    const input = {
      projectId, subject, description, question, requestedBy,
      assignedTo: assignedTo || undefined, priority, dateSubmitted, requiredResponseDate,
      actualResponseDate: rfiStatus === "answered" || rfiStatus === "closed" ? (rfi?.actualResponseDate ?? new Date().toISOString().slice(0, 10)) : undefined,
      rfiStatus, answer: answer || undefined,
    };
    if (rfi) { updateRfi(rfi.id, input); } else { createRfi(input); }
    onOpenChange(false);
  }
  function handleDelete() { if (!rfi) return; deleteRfi(rfi.id); onOpenChange(false); }
  const canSave = !!projectId && !!subject && !!question && !!requestedBy && !!requiredResponseDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{rfi ? `Edit ${rfi.rfiNumber}` : "New RFI"}</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label>Property</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>{MOCK_PROJECTS.map((p) => (<SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div><Label htmlFor="subject">Subject</Label><Input id="subject" className="mt-1.5" value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
          <div><Label htmlFor="description">Description (optional)</Label><Textarea id="description" className="mt-1.5" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div><Label htmlFor="question">Question</Label><Textarea id="question" className="mt-1.5" value={question} onChange={(e) => setQuestion(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="requestedBy">Requested By</Label><Input id="requestedBy" className="mt-1.5" value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} /></div>
            <div><Label htmlFor="assignedTo">Assigned To (optional)</Label><Input id="assignedTo" className="mt-1.5" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as RFI["priority"])}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITY_OPTIONS.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="dateSubmitted">Date Submitted</Label><Input id="dateSubmitted" type="date" className="mt-1.5" value={dateSubmitted} onChange={(e) => setDateSubmitted(e.target.value)} /></div>
            <div><Label htmlFor="requiredResponseDate">Response Needed By</Label><Input id="requiredResponseDate" type="date" className="mt-1.5" value={requiredResponseDate} onChange={(e) => setRequiredResponseDate(e.target.value)} /></div>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={rfiStatus} onValueChange={(v) => setRfiStatus(v as RfiStatus)}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUS_OPTIONS.map((s) => (<SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div><Label htmlFor="answer">Answer (optional)</Label><Textarea id="answer" className="mt-1.5" value={answer} onChange={(e) => setAnswer(e.target.value)} /></div>
        </div>
        <DialogFooter className="sm:justify-between">
          {rfi ? (confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete this RFI?</span>
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
