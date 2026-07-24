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
import { updateRFQ, getRFQStatus } from "@/lib/procurement/rfq-store";
import { useProjects } from "@/hooks/use-projects";
import { useVendors } from "@/hooks/use-vendors";
import { useMaterialRequests } from "@/hooks/use-material-requests";
import type { RequestForQuotation } from "@/types/procurement";

interface Props {
  rfq: RequestForQuotation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NONE = "none";

export function RfqEditDialog({ rfq, open, onOpenChange }: Props) {
  const projects = useProjects();
  const materialRequests = useMaterialRequests();
  const vendors = useVendors();

  const [projectId, setProjectId] = React.useState("");
  const [materialRequestId, setMaterialRequestId] = React.useState(NONE);
  const [vendorIds, setVendorIds] = React.useState<string[]>([]);
  const [issueDate, setIssueDate] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [materialList, setMaterialList] = React.useState("");
  const [scope, setScope] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [manualStatus, setManualStatus] = React.useState<"none" | "closed" | "cancelled">("none");

  React.useEffect(() => {
    if (rfq) {
      setProjectId(rfq.projectId);
      setMaterialRequestId(rfq.materialRequestId ?? NONE);
      setVendorIds(rfq.vendorIds);
      setIssueDate(rfq.issueDate);
      setDueDate(rfq.dueDate);
      setMaterialList(rfq.materialList);
      setScope(rfq.scope ?? "");
      setNotes(rfq.notes ?? "");
      setManualStatus(rfq.manualStatus ?? "none");
    }
  }, [rfq]);

  function toggleVendor(id: string, checked: boolean) {
    setVendorIds((prev) => (checked ? [...prev, id] : prev.filter((v) => v !== id)));
  }

  function handleSave() {
    if (!rfq || !projectId || !materialList || !dueDate || vendorIds.length === 0) return;
    updateRFQ(rfq.id, {
      projectId,
      materialRequestId: materialRequestId === NONE ? undefined : materialRequestId,
      vendorIds,
      issueDate,
      dueDate,
      materialList,
      scope: scope || undefined,
      notes: notes || undefined,
      manualStatus: manualStatus === "none" ? undefined : manualStatus,
    });
    onOpenChange(false);
  }

  const canSave = !!projectId && !!materialList && !!dueDate && vendorIds.length > 0;
  const responseCountAtRisk = rfq
    ? rfq.responses.filter((r) => !vendorIds.includes(r.vendorId)).length
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit RFQ {rfq?.rfqNumber}</DialogTitle>
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
              value={materialList}
              onChange={(e) => setMaterialList(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="scope">Scope (optional)</Label>
            <Textarea id="scope" className="mt-1.5" value={scope} onChange={(e) => setScope(e.target.value)} />
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
            <Label>Invited Vendors</Label>
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
            {responseCountAtRisk > 0 && (
              <p className="mt-1.5 text-xs text-warning-foreground">
                Removing these vendors will also remove their already-logged quote
                {responseCountAtRisk > 1 ? "s" : ""} from this RFQ.
              </p>
            )}
          </div>

          <div>
            <Label>Status Override</Label>
            <Select value={manualStatus} onValueChange={(v) => setManualStatus(v as typeof manualStatus)}>
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  None — track automatically ({rfq ? getRFQStatus(rfq) : "open"})
                </SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-muted-foreground">
              Normally this status tracks itself from logged quotes (open → partial →
              quoted → awarded). Use this only to close or cancel an RFQ you&apos;re no
              longer pursuing.
            </p>
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
          <Button onClick={handleSave} disabled={!canSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
