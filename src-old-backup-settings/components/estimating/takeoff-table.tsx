"use client";
import * as React from "react";
import { Pencil, Plus, Upload, Printer } from "lucide-react";
import { useTakeoffItems } from "@/hooks/use-takeoff-items";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { MATERIAL_RULES } from "@/lib/forecast/material-detector";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TakeoffEditDialog } from "@/components/estimating/takeoff-edit-dialog";
import { ImportTakeoffDialog } from "@/components/estimating/import-takeoff-dialog";
import { openPrintWindow } from "@/lib/estimating/print-window";
import { buildTakeoffListHtml } from "@/lib/estimating/print-content";
import type { TakeoffItem } from "@/types/estimating";

function projectName(id: string) {
  return MOCK_PROJECTS.find((p) => p.id === id)?.projectName ?? id;
}
function materialLabel(key?: string) {
  if (!key) return null;
  return MATERIAL_RULES.find((r) => r.key === key)?.label ?? key;
}
function quantityDisplay(t: TakeoffItem) {
  if (t.wasteFactorPercent) {
    return `${t.quantity.toLocaleString()} ${t.unit} + ${t.wasteFactorPercent}% waste = ${t.adjustedQuantity.toLocaleString()} ${t.unit}`;
  }
  return `${t.quantity.toLocaleString()} ${t.unit}`;
}

export function TakeoffTable() {
  const items = useTakeoffItems();
  const [editing, setEditing] = React.useState<TakeoffItem | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [importing, setImporting] = React.useState(false);

  const byProject = new Map<string, TakeoffItem[]>();
  for (const t of items) {
    if (!byProject.has(t.projectId)) byProject.set(t.projectId, []);
    byProject.get(t.projectId)!.push(t);
  }
  const projectIds = [...byProject.keys()].sort((a, b) => projectName(a).localeCompare(projectName(b)));

  function handlePrint() {
    openPrintWindow("Takeoff", buildTakeoffListHtml(items, projectName));
  }

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Quantity takeoffs, grouped by project. Items tagged with a Forecast Match feed
          Procurement&apos;s Forecast tab automatically.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="outline" onClick={handlePrint}>
            <Printer className="size-3.5" /> Print
          </Button>
          <Button size="sm" variant="outline" onClick={() => setImporting(true)}>
            <Upload className="size-3.5" /> Import
          </Button>
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="size-3.5" /> New Takeoff Item
          </Button>
        </div>
      </div>

      {projectIds.length === 0 && (
        <Card className="p-6 text-center text-sm text-muted-foreground">No takeoff items yet — add one above.</Card>
      )}

      <div className="flex flex-col gap-4">
        {projectIds.map((projectId) => (
          <Card key={projectId} className="overflow-hidden py-0">
            <div className="border-b border-border bg-muted/40 px-4 py-2.5">
              <h3 className="text-sm font-semibold text-foreground">{projectName(projectId)}</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Item</th>
                  <th className="px-4 py-2.5 font-medium">Cost Code</th>
                  <th className="px-4 py-2.5 font-medium">Quantity</th>
                  <th className="px-4 py-2.5 font-medium">Feeds Forecast</th>
                  <th className="px-4 py-2.5 font-medium">Edit</th>
                </tr>
              </thead>
              <tbody>
                {byProject.get(projectId)!.map((t) => (
                  <tr key={t.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                    <td className="px-4 py-2.5 text-foreground max-w-sm">
                      {t.description}
                      {t.location && <span className="block text-xs text-muted-foreground">{t.location}</span>}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{t.costCode ?? "—"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{quantityDisplay(t)}</td>
                    <td className="px-4 py-2.5">
                      {t.materialKey ? (
                        <Badge className="bg-info-soft text-info-foreground border-transparent">
                          {materialLabel(t.materialKey)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Not linked</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <Button variant="ghost" size="icon" onClick={() => setEditing(t)}>
                        <Pencil className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ))}
      </div>

      <TakeoffEditDialog item={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      <TakeoffEditDialog item={null} open={creating} onOpenChange={setCreating} />
      <ImportTakeoffDialog open={importing} onOpenChange={setImporting} />
    </>
  );
}
