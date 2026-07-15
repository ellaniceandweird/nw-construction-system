"use client";

import * as React from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { useCostCodes } from "@/hooks/use-cost-codes";
import { deleteCostCode } from "@/lib/estimating/cost-code-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CostCodeEditDialog } from "@/components/estimating/cost-code-edit-dialog";
import type { CostCode } from "@/types/estimating";

export function CostCodesTable() {
  const costCodes = useCostCodes();
  const [editing, setEditing] = React.useState<CostCode | null>(null);
  const [creating, setCreating] = React.useState(false);

  const sorted = [...costCodes].sort((a, b) => a.code.localeCompare(b.code));

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Shared cost code library used by Takeoff, Estimates, and Purchase Order line items.
        </p>
        <Button size="sm" onClick={() => setCreating(true)} className="shrink-0">
          <Plus className="size-3.5" /> New Cost Code
        </Button>
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Division</th>
              <th className="px-4 py-3 font-medium">Trade</th>
              <th className="px-4 py-3 font-medium">Edit</th>
              <th className="px-4 py-3 font-medium">Delete</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => (
              <tr key={c.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{c.code}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.description}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.division}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.trade ?? "—"}</td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(c)}>
                    <Pencil className="size-3.5" />
                  </Button>
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="icon" onClick={() => deleteCostCode(c.id)}>
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <CostCodeEditDialog costCode={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      <CostCodeEditDialog costCode={null} open={creating} onOpenChange={setCreating} />
    </>
  );
}
