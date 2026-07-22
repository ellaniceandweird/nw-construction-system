"use client";

import * as React from "react";
import { ArrowUpDown } from "lucide-react";

import { useEstimates } from "@/hooks/use-estimates";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { useChangeOrders } from "@/hooks/use-change-orders";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { computePortfolioTotals } from "@/lib/estimating/portfolio-rollup";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function currency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
function projectName(id: string) {
  return MOCK_PROJECTS.find((p) => p.id === id)?.projectName ?? id;
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone?: "success" | "destructive" }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 font-mono text-xl font-semibold ${tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-foreground"}`}>
        {value}
      </p>
    </Card>
  );
}

export function PortfolioRollupTable() {
  const estimates = useEstimates();
  const purchaseOrders = usePurchaseOrders();
  const changeOrders = useChangeOrders();
  const [sortBy, setSortBy] = React.useState<"project" | "budget_desc" | "variance_asc">("project");

  const totals = computePortfolioTotals(estimates, purchaseOrders, changeOrders);
  const anyActuals = totals.rows.some((r) => r.hasActuals);
  const sortedRows = [...totals.rows].sort((a, b) => {
    if (sortBy === "budget_desc") return b.revisedBudget - a.revisedBudget;
    if (sortBy === "variance_asc") return a.variance - b.variance;
    return projectName(a.projectId).localeCompare(projectName(b.projectId));
  });

  return (
    <>
      <p className="mb-3 text-xs text-muted-foreground">
        Totals every property with an estimate into one view — original estimates,
        approved change orders, and real spend logged in Procurement, all in one place.
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <SummaryCard label="Original Estimated" value={currency(totals.totalOriginalEstimated)} />
        <SummaryCard
          label="Approved Changes"
          value={`${totals.totalApprovedChanges >= 0 ? "+" : ""}${currency(totals.totalApprovedChanges)}`}
        />
        <SummaryCard label="Revised Budget" value={currency(totals.totalRevisedBudget)} />
        <SummaryCard label="Actual to Date" value={anyActuals ? currency(totals.totalActual) : "—"} />
        <SummaryCard
          label="Portfolio Variance"
          value={anyActuals ? `${totals.totalVariance >= 0 ? "+" : ""}${currency(totals.totalVariance)}` : "—"}
          tone={anyActuals ? (totals.totalVariance >= 0 ? "success" : "destructive") : undefined}
        />
      </div>

      <div className="mb-3 flex items-center gap-3">
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[180px]"><ArrowUpDown className="size-3.5 text-muted-foreground" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="project">Property (A-Z)</SelectItem>
            <SelectItem value="budget_desc">Revised Budget (Highest)</SelectItem>
            <SelectItem value="variance_asc">Variance (Worst First)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Estimate Number</th>
              <th className="px-4 py-3 font-medium">Original Estimate</th>
              <th className="px-4 py-3 font-medium">Approved Changes</th>
              <th className="px-4 py-3 font-medium">Revised Budget</th>
              <th className="px-4 py-3 font-medium">Actual to Date</th>
              <th className="px-4 py-3 font-medium">Variance</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((r) => (
              <tr key={r.estimateId} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{projectName(r.projectId)}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.estimateNumber}</td>
                <td className="px-4 py-3 text-muted-foreground">{currency(r.originalEstimate)}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {r.approvedChanges !== 0 ? `${r.approvedChanges > 0 ? "+" : ""}${currency(r.approvedChanges)}` : "—"}
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{currency(r.revisedBudget)}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.hasActuals ? currency(r.actual) : "—"}</td>
                <td className="px-4 py-3">
                  {r.hasActuals ? (
                    <Badge className={`${r.variance >= 0 ? "bg-success-soft text-success" : "bg-destructive-soft text-destructive"} border-transparent`}>
                      {r.variance >= 0 ? "+" : ""}
                      {currency(r.variance)}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
            {totals.rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                  No estimates yet — create one on the Estimates tab.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}
