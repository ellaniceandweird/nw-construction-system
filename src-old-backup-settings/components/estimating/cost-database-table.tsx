"use client";
import * as React from "react";
import { Pencil, Plus } from "lucide-react";
import { useCostDatabase } from "@/hooks/use-cost-database";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CostDatabaseEditDialog } from "@/components/estimating/cost-database-edit-dialog";
import type { CostDatabaseItem } from "@/types/estimating";

function currency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
function totalPerUnit(r: CostDatabaseItem) {
  return r.laborCost + r.materialCost + r.equipmentCost + r.subcontractCost;
}

export function CostDatabaseTable() {
  const rates = useCostDatabase();
  const [editing, setEditing] = React.useState<CostDatabaseItem | null>(null);
  const [creating, setCreating] = React.useState(false);
  const sorted = [...rates].sort((a, b) => a.costCode.localeCompare(b.costCode));

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Default per-unit rates by cost code. When building an estimate, use &quot;Apply Rate&quot;
          on a line item to autofill labor/material/equipment/subcontract costs instead of typing them.
        </p>
        <Button size="sm" onClick={() => setCreating(true)} className="shrink-0">
          <Plus className="size-3.5" /> New Rate
        </Button>
      </div>
      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Cost Code</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Unit</th>
              <th className="px-4 py-3 font-medium">Labor</th>
              <th className="px-4 py-3 font-medium">Material</th>
              <th className="px-4 py-3 font-medium">Equipment</th>
              <th className="px-4 py-3 font-medium">Subcontract</th>
              <th className="px-4 py-3 font-medium">Total / Unit</th>
              <th className="px-4 py-3 font-medium">Markup</th>
              <th className="px-4 py-3 font-medium">Edit</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{r.costCode}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.description}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.unit}</td>
                <td className="px-4 py-3 text-muted-foreground">{currency(r.laborCost)}</td>
                <td className="px-4 py-3 text-muted-foreground">{currency(r.materialCost)}</td>
                <td className="px-4 py-3 text-muted-foreground">{currency(r.equipmentCost)}</td>
                <td className="px-4 py-3 text-muted-foreground">{currency(r.subcontractCost)}</td>
                <td className="px-4 py-3 font-medium text-foreground">{currency(totalPerUnit(r))}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.profitPercent != null ? `${r.profitPercent}%` : "—"}</td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(r)}><Pencil className="size-3.5" /></Button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-6 text-center text-muted-foreground">No rates yet — add one above.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
      <CostDatabaseEditDialog item={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      <CostDatabaseEditDialog item={null} open={creating} onOpenChange={setCreating} />
    </>
  );
}
