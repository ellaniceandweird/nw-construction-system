"use client";

import * as React from "react";
import { Upload, AlertTriangle, Sparkles, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createEstimate, withComputedLineItemTotals } from "@/lib/estimating/estimate-store";
import { useProjects } from "@/hooks/use-projects";
import type { EstimateLineItem } from "@/types/estimating";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Stage = "pick" | "generating" | "review" | "error" | "done";

interface DrawingLineItem extends Omit<EstimateLineItem, "totalCost"> {
  confidence?: "high" | "medium" | "low";
  note?: string;
}

const CONFIDENCE_CLASS: Record<string, string> = {
  high: "bg-success-soft text-success",
  medium: "bg-warning-soft text-warning-foreground",
  low: "bg-destructive-soft text-destructive",
};

export function DrawingEstimateDialog({ open, onOpenChange }: Props) {
  const projects = useProjects();
  const [stage, setStage] = React.useState<Stage>("pick");
  const [fileName, setFileName] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [lineItems, setLineItems] = React.useState<DrawingLineItem[]>([]);
  const [projectId, setProjectId] = React.useState("");

  function reset() {
    setStage("pick");
    setFileName("");
    setErrorMessage("");
    setLineItems([]);
    setProjectId("");
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setStage("generating");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/estimate-from-drawing", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error ?? "Something went wrong generating an estimate from this drawing.");
        setStage("error");
        return;
      }

      const parsed = (data.lineItems ?? []) as Array<{
        description: string;
        quantity: number;
        unit: string;
        estimatedUnitCost: number;
        costCodeGuess?: string;
        confidence?: "high" | "medium" | "low";
        note?: string;
      }>;

      setLineItems(
        parsed.map((item) => ({
          costCode: item.costCodeGuess ?? "",
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          laborCost: 0,
          materialCost: item.quantity * item.estimatedUnitCost,
          equipmentCost: 0,
          subcontractCost: 0,
          markupPercent: 0,
          confidence: item.confidence,
          note: item.note,
        }))
      );
      setStage("review");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong reading the response.");
      setStage("error");
    }
  }

  function updateLineItem(index: number, patch: Partial<DrawingLineItem>) {
    setLineItems((prev) => prev.map((li, i) => (i === index ? { ...li, ...patch } : li)));
  }
  function removeLineItem(index: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleConfirm() {
    if (!projectId || lineItems.length === 0) return;
    createEstimate({
      projectId,
      estimator: "Unassigned",
      estimateDate: new Date().toISOString().slice(0, 10),
      estimateStatus: "draft",
      lineItems: withComputedLineItemTotals(
        lineItems.map(({ confidence: _c, note: _n, ...rest }) => rest)
      ),
      notes: `Draft generated from drawing "${fileName}" — every line needs verification against actual dimensions and your real pricing before use.`,
    });
    setStage("done");
  }

  const canConfirm = !!projectId && lineItems.length > 0;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next); }}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Estimate from Drawing</DialogTitle>
          <DialogDescription>
            Upload a floor plan, elevation, or sketch — Claude reads visible scope and
            drafts preliminary line items. Every number here is a starting-point
            assumption, not a real takeoff — review carefully before using it.
          </DialogDescription>
        </DialogHeader>

        {stage === "pick" && (
          <div className="flex flex-col gap-4">
            <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border p-10 text-center hover:bg-accent/40">
              <Upload className="size-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Click to choose a drawing, or drag one here</p>
                <p className="mt-1 text-xs text-muted-foreground">Image (PNG/JPG) or PDF</p>
              </div>
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileSelect} />
            </label>

            <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">What this actually does</p>
              <p className="mt-1">
                This sends the drawing to Claude&apos;s vision model, which reads what&apos;s
                visibly labeled and drafts rough quantities and unit costs — it has no
                idea what your actual material or labor rates are, so treat every price
                as a placeholder assumption. It also can&apos;t measure anything that
                isn&apos;t already dimensioned on the page. This needs your own
                ANTHROPIC_API_KEY configured in .env.local to run — see the project README
                if it&apos;s not set up yet.
              </p>
            </div>
          </div>
        )}

        {stage === "generating" && (
          <div className="flex flex-col items-center gap-3 py-12">
            <Sparkles className="size-8 animate-pulse text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Reading {fileName}…</p>
          </div>
        )}

        {stage === "error" && (
          <div className="flex flex-col gap-4">
            <p className="flex items-start gap-2 rounded-lg bg-destructive-soft p-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              {errorMessage}
            </p>
            <Button variant="outline" onClick={reset}>Try Again</Button>
          </div>
        )}

        {stage === "review" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-2 rounded-lg bg-warning-soft p-3 text-sm text-warning-foreground">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              <p>
                Claude drafted {lineItems.length} line item{lineItems.length === 1 ? "" : "s"} from
                this drawing. Quantities and costs are assumptions — verify against real
                dimensions and your own pricing before using this estimate.
              </p>
            </div>

            <div>
              <Label>Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
              {lineItems.map((li, i) => (
                <div key={i} className="rounded-md border border-border p-2">
                  <div className="grid grid-cols-1 items-end gap-2 sm:grid-cols-[1fr_80px_60px_90px_auto]">
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Input className="mt-1" value={li.description} onChange={(e) => updateLineItem(i, { description: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs">Qty</Label>
                      <Input type="number" className="mt-1" value={li.quantity} onChange={(e) => updateLineItem(i, { quantity: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <Label className="text-xs">Unit</Label>
                      <Input className="mt-1" value={li.unit} onChange={(e) => updateLineItem(i, { unit: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs">Est. Cost ($)</Label>
                      <Input type="number" className="mt-1" value={li.materialCost} onChange={(e) => updateLineItem(i, { materialCost: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeLineItem(i)}>
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                  {(li.confidence || li.note) && (
                    <div className="mt-1.5 flex items-start gap-2 text-xs text-muted-foreground">
                      {li.confidence && (
                        <Badge className={`${CONFIDENCE_CLASS[li.confidence]} border-transparent shrink-0`}>
                          {li.confidence} confidence
                        </Badge>
                      )}
                      {li.note && <span>{li.note}</span>}
                    </div>
                  )}
                </div>
              ))}
              {lineItems.length === 0 && (
                <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                  Claude didn&apos;t find identifiable scope in this drawing.
                </p>
              )}
            </div>
          </div>
        )}

        {stage === "done" && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="text-lg font-semibold text-success">Draft estimate created</p>
            <p className="text-sm text-muted-foreground">
              Saved as a draft — go verify every quantity and cost before sending it anywhere.
            </p>
          </div>
        )}

        <DialogFooter>
          {stage === "review" && (
            <>
              <Button variant="outline" onClick={reset}>Start Over</Button>
              <Button onClick={handleConfirm} disabled={!canConfirm}>Save Draft Estimate</Button>
            </>
          )}
          {stage === "done" && <Button onClick={() => onOpenChange(false)}>Done</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
