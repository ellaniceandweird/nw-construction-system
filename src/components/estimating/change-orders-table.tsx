"use client";
import * as React from "react";
import { Pencil, Plus } from "lucide-react";
import { useChangeOrders } from "@/hooks/use-change-orders";
import { useEstimates } from "@/hooks/use-estimates";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChangeOrderEditDialog } from "@/components/estimating/change-order-edit-dialog";
import { requiresOwnerApproval, getOwnerApprovalThreshold } from "@/lib/estimating/change-order-approval";
import type { ChangeOrder } from "@/types/change-orders";

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-warning-soft text-warning-foreground",
  approved: "bg-success-soft text-success",
  rejected: "bg-destructive-soft text-destructive",
};

function currency(n: number) {
  const sign = n < 0 ? "-" : "";
  return `${sign}${Math.abs(n).toLocaleString("en-US", { style: "currency", currency: "USD" })}`;
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function projectName(id: string) {
  return MOCK_PROJECTS.find((p) => p.id === id)?.projectName ?? id;
}

export function ChangeOrdersTable() {
  const changeOrders = useChangeOrders();
  const estimates = useEstimates();
  const [editing, setEditing] = React.useState<ChangeOrder | null>(null);
  const [creating, setCreating] = React.useState(false);

  const sorted = [...changeOrders].sort((a, b) => new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime());

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Scope or cost changes after a budget is approved. Approved change orders
          automatically adjust the Revised Budget shown in Cost Tracking and Portfolio Rollup.
          Changes over {currency(getOwnerApprovalThreshold())} are flagged for owner approval.
        </p>
        <Button size="sm" onClick={() => setCreating(true)} className="shrink-0">
          <Plus className="size-3.5" /> New Change Order
        </Button>
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">CO Number</th>
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Cost Impact</th>
              <th className="px-4 py-3 font-medium">Requested</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Approval</th>
              <th className="px-4 py-3 font-medium">Edit</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => {
              const estimate = estimates.find((e) => e.id === c.estimateId);
              return (
                <tr key={c.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                  <td className="px-4 py-3 font-medium text-foreground">{c.changeOrderNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {estimate ? projectName(estimate.projectId) : projectName(c.projectId)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-md">{c.description}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.relatedItem ?? "—"}</td>
                  <td className={`px-4 py-3 font-medium ${c.costImpact >= 0 ? "text-foreground" : "text-destructive"}`}>
                    {c.costImpact >= 0 ? "+" : ""}
                    {currency(c.costImpact)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(c.requestedDate)}</td>
                  <td className="px-4 py-3">
                    <Badge className={`${STATUS_CLASS[c.changeOrderStatus]} border-transparent`}>{c.changeOrderStatus}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {requiresOwnerApproval(c.costImpact) ? (
                      <Badge className="bg-destructive-soft text-destructive border-transparent">
                        Requires Owner Approval
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Within budget authority</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(c)}><Pencil className="size-3.5" /></Button>
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-6 text-center text-muted-foreground">No change orders yet — add one above.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <ChangeOrderEditDialog changeOrder={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      <ChangeOrderEditDialog changeOrder={null} open={creating} onOpenChange={setCreating} />
    </>
  );
}
