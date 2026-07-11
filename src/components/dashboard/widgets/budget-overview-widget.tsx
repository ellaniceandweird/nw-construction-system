import Link from "next/link";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getBudgetOverview } from "@/lib/dashboard/metrics";

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function BudgetOverviewWidget() {
  const { totalBudget, actualCost, remaining, percentUsed } = getBudgetOverview();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Overview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Budget</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(totalBudget)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Actual Cost to Date</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(actualCost)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Remaining Budget</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(remaining)}
          </span>
        </div>
        <Progress
          value={percentUsed}
          indicatorClassName={
            percentUsed > 100 ? "bg-destructive" : "bg-success"
          }
        />
        <span className="text-xs text-muted-foreground">
          {percentUsed}% of budget used
        </span>
        <Link
          href="/financial"
          className="mt-1 text-xs font-medium text-primary hover:underline"
        >
          View financials
        </Link>
      </CardContent>
    </Card>
  );
}
