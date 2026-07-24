"use client";

import * as React from "react";
import { CheckCircle2, XCircle, Inbox } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBudgets } from "@/hooks/use-budgets";
import { useEstimates } from "@/hooks/use-estimates";
import { useChangeOrders } from "@/hooks/use-change-orders";
import { useProjects } from "@/hooks/use-projects";
import { buildApprovalQueue, type ApprovalKind } from "@/lib/approvals/approval-queue";
import { approveBudget, rejectBudget } from "@/lib/financial/budget-store";
import { approveEstimate, rejectEstimate } from "@/lib/estimating/estimate-store";
import { approveChangeOrder, rejectChangeOrder } from "@/lib/estimating/change-order-store";
import { showSuccessToast } from "@/lib/toast/toast-store";

const APPROVERS = ["Sjaak", "Carlo", "Ben"] as const;

const KIND_BADGE: Record<ApprovalKind, string> = {
  budget: "bg-primary-soft text-primary",
  estimate: "bg-info-soft text-info-foreground",
  change_order: "bg-warning-soft text-warning-foreground",
};

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ApprovalsTable() {
  const budgets = useBudgets();
  const estimates = useEstimates();
  const changeOrders = useChangeOrders();
  const projects = useProjects();
  const [kindFilter, setKindFilter] = React.useState<"all" | ApprovalKind>("all");

  const queue = buildApprovalQueue(budgets, estimates, changeOrders, projects);
  const filtered = kindFilter === "all" ? queue : queue.filter((i) => i.kind === kindFilter);

  function handleApprove(kind: ApprovalKind, id: string, approver: string) {
    if (kind === "budget") approveBudget(id, approver);
    else if (kind === "estimate") approveEstimate(id, approver);
    else approveChangeOrder(id, approver);
    showSuccessToast(`Approved by ${approver}`);
  }

  function handleReject(kind: ApprovalKind, id: string) {
    if (kind === "budget") rejectBudget(id);
    else if (kind === "estimate") rejectEstimate(id);
    else rejectChangeOrder(id);
    showSuccessToast("Sent back for revision");
  }

  return (
    <>
      <p className="mb-3 text-xs text-muted-foreground">
        Everything currently waiting on sign-off — budgets, quotes (estimates out for owner
        review), and change orders. Any of Sjaak, Carlo, or Ben can approve or send an item back.
      </p>

      <div className="mb-3 flex items-center gap-3">
        <Select value={kindFilter} onValueChange={(v) => setKindFilter(v as typeof kindFilter)}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="budget">Budgets</SelectItem>
            <SelectItem value="estimate">Quotes</SelectItem>
            <SelectItem value="change_order">Change Orders</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} awaiting approval</span>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((item) => (
          <Card key={`${item.kind}-${item.id}`} className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Badge className={`border-transparent ${KIND_BADGE[item.kind]}`}>{item.kindLabel}</Badge>
                  <span className="font-medium text-foreground">{item.title}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.projectName} &middot; Requested by {item.requestedBy} on {formatDate(item.requestedDate)}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold text-foreground">{formatCurrency(item.amount)}</span>
                <div className="flex items-center gap-1.5">
                  {APPROVERS.map((approver) => (
                    <Button
                      key={approver}
                      size="sm"
                      variant="outline"
                      className="border-success/30 text-success hover:bg-success-soft"
                      onClick={() => handleApprove(item.kind, item.id, approver)}
                    >
                      <CheckCircle2 className="size-3.5" /> {approver}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleReject(item.kind, item.id)}
                  >
                    <XCircle className="size-3.5" /> Send Back
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <Inbox className="size-6 opacity-40" />
            Nothing waiting on approval right now.
          </Card>
        )}
      </div>
    </>
  );
}
