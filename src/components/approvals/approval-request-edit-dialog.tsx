"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useProjects } from "@/hooks/use-projects";
import {
  createApprovalRequest,
  updateApprovalRequest,
  deleteApprovalRequest,
} from "@/lib/approvals/approval-request-store";
import { computeRequiredApprovers } from "@/lib/approvals/approval-rules";
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast-store";
import { ALL_APPROVERS, type ApprovalRequest, type ApproverName } from "@/types/approvals";

interface Props {
  request: ApprovalRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApprovalRequestEditDialog({ request, open, onOpenChange }: Props) {
  const projects = useProjects();
  const [title, setTitle] = React.useState("");
  const [projectName, setProjectName] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [requestedBy, setRequestedBy] = React.useState("");
  const [requestedDate, setRequestedDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [requiredApprovers, setRequiredApprovers] = React.useState<ApproverName[]>(["Sjaak"]);
  const [approversTouched, setApproversTouched] = React.useState(false);
  const [notes, setNotes] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const isManual = !request || request.kind === "manual";

  React.useEffect(() => {
    if (!open) return;
    setConfirmingDelete(false);
    setApproversTouched(false);
    if (request) {
      setTitle(request.title);
      setProjectName(request.projectName);
      setAmount(String(request.amount));
      setRequestedBy(request.requestedBy);
      setRequestedDate(request.requestedDate);
      setRequiredApprovers(request.requiredApprovers);
      setNotes(request.notes ?? "");
    } else {
      setTitle("");
      setProjectName("");
      setAmount("");
      setRequestedBy("");
      setRequestedDate(new Date().toISOString().slice(0, 10));
      setRequiredApprovers(["Sjaak"]);
      setNotes("");
    }
  }, [request, open]);

  // For a brand-new manual entry, auto-suggest the required approvers
  // from the dollar amount, unless the person has manually changed the
  // checkboxes themselves.
  React.useEffect(() => {
    if (!isManual || approversTouched) return;
    const parsed = parseFloat(amount);
    if (!Number.isNaN(parsed)) {
      setRequiredApprovers(computeRequiredApprovers("manual" as ApprovalRequest["kind"], parsed));
    }
  }, [amount, isManual, approversTouched]);

  function toggleApprover(name: ApproverName) {
    setApproversTouched(true);
    setRequiredApprovers((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  }

  async function handleSave() {
    const input = {
      kind: (request?.kind ?? "manual") as ApprovalRequest["kind"],
      sourceId: request?.sourceId,
      title,
      projectName,
      amount: parseFloat(amount) || 0,
      requestedBy,
      requestedDate,
      requiredApprovers,
      notes: notes || undefined,
    };
    setSaving(true);
    const result = request ? await updateApprovalRequest(request.id, input) : await createApprovalRequest(input);
    setSaving(false);
    if (!result.ok) {
      showErrorToast(result.error ? `Couldn't save: ${result.error}` : "Couldn't save this approval — check your connection and try again.");
      return;
    }
    showSuccessToast(request ? "Approval updated" : "Approval added");
    onOpenChange(false);
  }

  function handleDelete() {
    if (!request) return;
    deleteApprovalRequest(request.id);
    onOpenChange(false);
  }

  const canSave = !!title.trim() && !!projectName.trim() && !!requestedBy.trim() && requiredApprovers.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{request ? "Edit Approval Request" : "New Manual Approval Request"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {!isManual && (
            <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              This tracks sign-off for a real {request?.kind.replace("_", " ")} record — editing here
              only adjusts who needs to approve and notes, not the underlying amount or project.
            </p>
          )}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" className="mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} disabled={!isManual} placeholder="e.g. New scaffolding rental" />
          </div>
          <div>
            <Label htmlFor="projectName">Project</Label>
            {isManual ? (
              <Input
                id="projectName"
                className="mt-1.5"
                list="approval-project-list"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Type or pick a project"
              />
            ) : (
              <Input id="projectName" className="mt-1.5" value={projectName} disabled />
            )}
            <datalist id="approval-project-list">
              {projects.map((p) => (<option key={p.id} value={p.projectName} />))}
            </datalist>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount ($)</Label>
              <Input id="amount" type="number" className="mt-1.5" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={!isManual} />
            </div>
            <div>
              <Label htmlFor="requestedDate">Requested Date</Label>
              <Input id="requestedDate" type="date" className="mt-1.5" value={requestedDate} onChange={(e) => setRequestedDate(e.target.value)} disabled={!isManual} />
            </div>
          </div>
          <div>
            <Label htmlFor="requestedBy">Requested By</Label>
            <Input id="requestedBy" className="mt-1.5" value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} disabled={!isManual} />
          </div>
          <div>
            <Label>Required Approvers</Label>
            <div className="mt-1.5 flex items-center gap-4">
              {ALL_APPROVERS.map((name) => (
                <label key={name} className="flex items-center gap-1.5 text-sm text-foreground">
                  <Checkbox checked={requiredApprovers.includes(name)} onCheckedChange={() => toggleApprover(name)} />
                  {name}
                </label>
              ))}
            </div>
            {isManual && (
              <p className="mt-1 text-xs text-muted-foreground">Auto-suggested from the amount — check/uncheck to override.</p>
            )}
          </div>
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" className="mt-1.5" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter className="justify-between">
          {request ? (confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete this{isManual ? "" : " tracking record"}?</span>
              <Button variant="destructive" size="sm" onClick={handleDelete}>Confirm Delete</Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmingDelete(true)}>
              <Trash2 className="size-3.5" /> Delete
            </Button>
          )) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!canSave || saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
