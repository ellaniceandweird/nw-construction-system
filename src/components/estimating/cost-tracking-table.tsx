"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";

import { useEstimates } from "@/hooks/use-estimates";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { computeDivisionBudget, computeTotalActual } from "@/lib/estimating/budget-tracking";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function currency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
function projectName(id: string) {
  return MOCK_PROJECTS.find((p) => p.id === id)?.projectName ?? id;
}

export function CostTrackingTable() {
  const estimates = useEstimates();
  const purchaseOrders = usePurchaseOrders();
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const sorted = [...estimates].sort((a, b) => projectName(a.projectId).localeCompare(projectName(b.projectId)));

  return (
    <>
      <p className="mb-3 text-xs text-muted-foreground">
        Compares each estimate&apos;s totals against real Purchase Orders already logged
        in Procurement for that project. Projects with no POs yet show &quot;—&quot; rather
        than $0, since there&apos;s simply no data yet.
      </p>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Estimate Number</th>
              <th className="px-4 py-3 font-medium">Estimated</th>
              <th className="px-4 py-3 font-medium">Actual to Date</th>
              <th className="px-4 py-3 font-medium">Variance</th>
              <th className="px-4 py-3 font-medium">% Spent</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((e) => {
              const projectPOs = purchaseOrders.filter((po) => po.projectId === e.projectId);
              const hasActuals = projectPOs.length > 0;
              const totalActual = computeTotalActual(projectPOs);
              const variance = e.totalEstimatedCost - totalActual;
              const percentSpent = e.totalEstimatedCost > 0 ? (totalActual / e.totalEstimatedCost) * 100 : 0;
              const isExpanded = expandedId === e.id;
              const divisionBudget = computeDivisionBudget(e.lineItems, projectPOs);

              return (
                <React.Fragment key={e.id}>
                  <tr className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                    <td className="px-4 py-3">
                      <button
                        className="flex items-center gap-1.5 font-medium text-foreground hover:text-primary hover:underline"
                        onClick={() => setExpandedId(isExpanded ? null : e.id)}
                      >
                        <ChevronRight className={`size-3.5 shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                        {projectName(e.projectId)}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{e.estimateNumber}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{currency(e.totalEstimatedCost)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{hasActuals ? currency(totalActual) : "—"}</td>
                    <td className="px-4 py-3">
                      {hasActuals ? (
                        <Badge className={`${variance >= 0 ? "bg-success-soft text-success" : "bg-destructive-soft text-destructive"} border-transparent`}>
                          {variance >= 0 ? "+" : ""}
                          {currency(variance)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{hasActuals ? `${percentSpent.toFixed(0)}%` : "—"}</td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={6} className="bg-muted/20 px-4 pb-4 pt-1">
                        <Card className="overflow-x-auto py-0">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                <th className="px-4 py-2.5 font-medium">Division</th>
                                <th className="px-4 py-2.5 font-medium">Estimated</th>
                                <th className="px-4 py-2.5 font-medium">Actual</th>
                                <th className="px-4 py-2.5 font-medium">Variance</th>
                              </tr>
                            </thead>
                            <tbody>
                              {divisionBudget.map((d) => (
                                <tr key={d.divisionKey} className="border-b border-border/60 last:border-0">
                                  <td className="px-4 py-2.5 text-foreground">{d.divisionLabel}</td>
                                  <td className="px-4 py-2.5 text-muted-foreground">{currency(d.estimated)}</td>
                                  <td className="px-4 py-2.5 text-muted-foreground">{hasActuals ? currency(d.actual) : "—"}</td>
                                  <td className={`px-4 py-2.5 font-medium ${hasActuals ? (d.variance >= 0 ? "text-success" : "text-destructive") : "text-muted-foreground"}`}>
                                    {hasActuals ? `${d.variance >= 0 ? "+" : ""}${currency(d.variance)}` : "—"}
                                  </td>
                                </tr>
                              ))}
                              {divisionBudget.length === 0 && (
                                <tr>
                                  <td colSpan={4} className="px-4 py-4 text-center text-muted-foreground">
                                    No line items or Purchase Orders to compare yet.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </Card>
                        {!hasActuals && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            No Purchase Orders logged for this project yet in Procurement.
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
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
