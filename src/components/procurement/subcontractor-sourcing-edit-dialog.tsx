"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects } from "@/hooks/use-projects";
import { useProperties } from "@/hooks/use-properties";
import { getPropertyDisplayName } from "@/lib/properties/property-relations";
import {
  createSubcontractorSourcing,
  updateSubcontractorSourcing,
  deleteSubcontractorSourcing,
} from "@/lib/procurement/subcontractor-sourcing-store";
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast-store";
import type { SubcontractorSourcingRequest, SubcontractorSourcingStatus } from "@/types/subcontractor-sourcing";

const STATUS_OPTIONS: { value: SubcontractorSourcingStatus; label: string }[] = [
  { value: "identifying", label: "Identifying Subs" },
  { value: "scoping", label: "Scoping" },
  { value: "quoting", label: "Quoting" },
  { value: "awarded", label: "Awarded" },
  { value: "on_hold", label: "On Hold" },
];

interface Props {
  entry: SubcontractorSourcingRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubcontractorSourcingEditDialog({ entry, open, onOpenChange }: Props) {
  const projects = useProjects();
  const properties = useProperties();
  const [projectId, setProjectId] = React.useState("");
  const [propertyId, setPropertyId] = React.useState("");
  const [trade, setTrade] = React.useState("");
  const [scopeOfWork, setScopeOfWork] = React.useState("");
  const [budget, setBudget] = React.useState("");
  const [sourcingStatus, setSourcingStatus] = React.useState<SubcontractorSourcingStatus>("identifying");
  const [notes, setNotes] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setConfirmingDelete(false);
    setProjectId(entry?.projectId ?? "");
    setPropertyId(entry?.propertyId ?? "");
    setTrade(entry?.trade ?? "");
    setScopeOfWork(entry?.scopeOfWork ?? "");
    setBudget(entry?.budget != null ? String(entry.budget) : "");
    setSourcingStatus(entry?.sourcingStatus ?? "identifying");
    setNotes(entry?.notes ?? "");
  }, [entry, open]);

  async function handleSave() {
    if (!trade || !scopeOfWork) return;
    const input = {
      projectId: projectId || undefined,
      propertyId: propertyId || undefined,
      propertyName: propertyId ? getPropertyDisplayName(properties.find((p) => p.id === propertyId)!) : undefined,
      trade,
      scopeOfWork,
      budget: budget ? parseFloat(budget) : undefined,
      sourcingStatus,
      notes: notes || undefined,
    };
    setSaving(true);
    const result = entry ? await updateSubcontractorSourcing(entry.id, input) : await createSubcontractorSourcing(input);
    setSaving(false);
    if (!result.ok) {
      showErrorToast(result.error ? `Couldn't save: ${result.error}` : "Couldn't save this entry — check your connection and try again.");
      return;
    }
    showSuccessToast(entry ? "Entry updated" : "Entry added");
    onOpenChange(false);
  }

  function handleDelete() {
    if (!entry) return;
    deleteSubcontractorSourcing(entry.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit Subcontractor Sourcing" : "New Subcontractor Sourcing"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label>Project (optional)</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>{projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Property (optional)</Label>
            <Select value={propertyId} onValueChange={setPropertyId}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select property" /></SelectTrigger>
              <SelectContent>{properties.map((p) => (<SelectItem key={p.id} value={p.id}>{getPropertyDisplayName(p)}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="trade">Trade</Label>
            <Input id="trade" className="mt-1.5" value={trade} onChange={(e) => setTrade(e.target.value)} placeholder="e.g. Electrical, Roofing" />
          </div>
          <div>
            <Label htmlFor="scopeOfWork">Scope of Work</Label>
            <Textarea id="scopeOfWork" className="mt-1.5" value={scopeOfWork} onChange={(e) => setScopeOfWork(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="budget">Budget (optional)</Label>
            <Input id="budget" type="number" className="mt-1.5" value={budget} onChange={(e) => setBudget(e.target.value)} />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={sourcingStatus} onValueChange={(v) => setSourcingStatus(v as SubcontractorSourcingStatus)}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUS_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" className="mt-1.5" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter className="justify-between">
          {entry ? (confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete this entry?</span>
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
            <Button onClick={handleSave} disabled={!trade || !scopeOfWork || saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
