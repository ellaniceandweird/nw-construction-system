"use client";

import * as React from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { useTakeoffItems } from "@/hooks/use-takeoff-items";
import { deleteTakeoffItem } from "@/lib/estimating/takeoff-store";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TakeoffEditDialog } from "@/components/estimating/takeoff-edit-dialog";
import type { TakeoffItem } from "@/types/estimating";

function projectName(id: string) {
  return MOCK_PROJECTS.find((p) => p.id === id)?.projectName ?? id;
}

export function TakeoffTable() {
  const items = useTakeoffItems();
  const [editing, setEditing] = React.useState<TakeoffItem | null>(null);
  const [creating, setCreating] = React.useState(false);

  const sorted = [...items].sort((a, b) => projectName(a.projectId).localeCompare(projectName(b.projectId)));

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Quantity takeoffs by project. Items with a Forecast match feed Procurement&apos;s
          Forecast tab quantities automatically.
        </p>
        <Button size="sm" onClick={() => setCreating(true)} className="shrink-0">
          <Plus className="size-3.5" /> New Takeoff Item
        </Button>
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Cost Code</th>
              <th className="px-4 py-3 font-medium">Quantity</th>
              <th className="px-4 py-3 font-medium">Waste %</th>
              <th className="px-4 py-3 font-medium">Adjusted Qty</th>
              <th className="px-4 py-3 font-medium">Forecast Match</th>
              <th className="px-4 py-3 font-medium">Edit</th>
              <th className="px-4 py-3 font-medium">Delete</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t) => (
              <tr key={t.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{projectName(t.projectId)}</td>
                <td className="px-4 py-3 text-muted-foreground max-w-xs">{t.description}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.costCode ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {t.quantity.toLocaleString()} {t.unit}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {t.wasteFactorPercent != null ? `${t.wasteFactorPercent}%` : "—"}
                </td>
                <td className="px-4 py-3 text-foreground">
                  {t.adjustedQuantity.toLocaleString()} {t.unit}
                </td>
                <td className="px-4 py-3">
                  {t.materialKey ? (
                    <Badge className="bg-info-soft text-info-foreground border-transparent">
                      {t.materialKey}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(t)}>
                    <Pencil className="size-3.5" />
                  </Button>
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="icon" onClick={() => deleteTakeoffItem(t.id)}>
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-muted-foreground">
                  No takeoff items yet — add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <TakeoffEditDialog item={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      <TakeoffEditDialog item={null} open={creating} onOpenChange={setCreating} />
    </>
  );
}
