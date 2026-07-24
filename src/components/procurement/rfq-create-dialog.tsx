"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createRFQ } from "@/lib/procurement/rfq-store";
import { DrivePickerButton } from "@/components/shared/drive-picker-button";
import type { DrivePickedFile } from "@/lib/google-drive/use-drive-picker";
import { Trash2 } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { useVendors } from "@/hooks/use-vendors";
import { useMaterialRequests } from "@/hooks/use-material-requests";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional prefill, e.g. when opened from the Forecast tab. */
  initialProjectId?: string;
  initialMaterialList?: string;
}

const NONE = "none";

export function RfqCreateDialog({
  open,
  onOpenChange,
  initialProjectId,
  initialMaterialList,
}: Props) {
  const projects = useProjects();
  const vendors = useVendors();
  const materialRequests = useMaterialRequests();

  const [projectId, setProjectId] = React.useState(initialProjectId ?? "");
  const [materialRequestId, setMaterialRequestId] = React.useState(NONE);
  const [vendorIds, setVendorIds] = React.useState<string[]>([]);
  const [issueDate, setIssueDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = React.useState("");
  const [scope, setScope] = React.useState("");
  const [materialList, setMaterialList] = React.useState(initialMaterialList ?? "");
  const [notes, setNotes] = React.useState("");
  const [attachments, setAttachments] = React.useState<{ name: string; url: string }[]>([]);

  React.useEffect(() => {
    if (open) {
      setProjectId(initialProjectId ?? "");
      setMaterialList(initialMaterialList ?? "");
    }
  }, [open, initialProjectId, initialMaterialList]);

  function reset() {
    setProjectId("");
    setMaterialRequestId(NONE);
    setVendorIds([]);
    setIssueDate(new Date().toISOString().slice(0, 10));
    setDueDate("");
    setScope("");
    setMaterialList("");
    setNotes("");
    setAttachments([]);
  }

  function handleAttachmentsPicked(files: DrivePickedFile[]) {
    setAttachments((prev) => [...prev, ...files.map((f) => ({ name: f.name, url: f.url }))]);
  }
  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  function toggleVendor(id: string, checked: boolean) {
    setVendorIds((prev) => (checked ? [...prev, id] : prev.filter((v) => v !== id)));
  }

  function handleCreate() {
    if (!projectId || !materialList || !dueDate || vendorIds.length === 0) return;
    createRFQ({
      projectId,
      materialRequestId: materialRequestId === NONE ? undefined : materialRequestId,
      vendorIds,
      issueDate,
      dueDate,
      scope: scope || undefined,
      materialList,
      notes: notes || undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
    });
    reset();
    onOpenChange(false);
  }

  const canCreate = !!projectId && !!materialList && !!dueDate && vendorIds.length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New RFQ</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.projectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Linked Material Request</Label>
              <Select value={materialRequestId} onValueChange={setMaterialRequestId}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {materialRequests.map((mr) => (
                    <SelectItem key={mr.id} value={mr.id}>
                      {mr.mrNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="materialList">Material List</Label>
            <Textarea
              id="materialList"
              className="mt-1.5"
              placeholder="What's being quoted — items, quantities, spec details"
              value={materialList}
              onChange={(e) => setMaterialList(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="scope">Scope (optional)</Label>
            <Textarea
              id="scope"
              className="mt-1.5"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                id="issueDate"
                type="date"
                className="mt-1.5"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                className="mt-1.5"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Invite Vendors</Label>
            <div className="mt-1.5 flex max-h-40 flex-col gap-2 overflow-y-auto rounded-md border border-border p-3">
              {vendors.filter((v) => v.supplierType !== "subcontractor").map((v) => (
                <label key={v.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={vendorIds.includes(v.id)}
                    onCheckedChange={(checked) => toggleVendor(v.id, checked === true)}
                  />
                  {v.vendorName}
                  <span className="text-xs text-muted-foreground">({v.vendorCategory})</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label>Attachments (spec sheets, photos — optional)</Label>
              <DrivePickerButton onSelect={handleAttachmentsPicked} multiple label="Attach from Google Drive" />
            </div>
            {attachments.length > 0 && (
              <div className="flex flex-col gap-1.5 rounded-md border border-border p-2">
                {attachments.map((a, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 text-sm">
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="truncate text-primary hover:underline">{a.name}</a>
                    <Button type="button" variant="ghost" size="icon" className="size-6 shrink-0" onClick={() => removeAttachment(i)}>
                      <Trash2 className="size-3 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" className="mt-1.5" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!canCreate}>
            Create RFQ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
