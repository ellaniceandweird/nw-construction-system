"use client";
import { useBudgets } from "@/hooks/use-budgets";
import { useCostTransactions } from "@/hooks/use-cost-transactions";
import { useInvoices } from "@/hooks/use-invoices";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { computeFinancialRollup } from "@/lib/financial/financial-rollup";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export function FinancialRollupTable() {
  const budgets = useBudgets();
  const transactions = useCostTransactions();
  const invoices = useInvoices();

  const totals = computeFinancialRollup(budgets, transactions, invoices);

  return (
    <>
      <p className="mb-3 text-xs text-muted-foreground">
        Totals every property with a budget into one view — current budget, real spend
        from the Cost Ledger, what&apos;s left, and outstanding vendor invoices.
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Total Budget" value={currency(totals.totalBudget)} />
        <SummaryCard label="Actual Spent" value={currency(totals.totalActualSpent)} />
        <SummaryCard
          label="Remaining"
          value={currency(totals.totalRemaining)}
          tone={totals.totalRemaining >= 0 ? "success" : "destructive"}
        />
        <SummaryCard label="Outstanding Invoices" value={currency(totals.totalOutstandingInvoices)} />
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Current Budget</th>
              <th className="px-4 py-3 font-medium">Actual Spent</th>
              <th className="px-4 py-3 font-medium">Remaining</th>
              <th className="px-4 py-3 font-medium">Outstanding Invoices</th>
            </tr>
          </thead>
          <tbody>
            {totals.rows.map((r) => (
              <tr key={r.budgetId} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{projectName(r.projectId)}</td>
                <td className="px-4 py-3 text-muted-foreground">{currency(r.currentBudget)}</td>
                <td className="px-4 py-3 text-muted-foreground">{currency(r.actualSpent)}</td>
                <td className="px-4 py-3">
                  <Badge className={`${r.remaining >= 0 ? "bg-success-soft text-success" : "bg-destructive-soft text-destructive"} border-transparent`}>
                    {currency(r.remaining)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {r.outstandingInvoices > 0 ? currency(r.outstandingInvoices) : "—"}
                </td>
              </tr>
            ))}
            {totals.rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                  No budgets yet — create one on the Budget tab.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}
