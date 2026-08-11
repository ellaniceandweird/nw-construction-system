"use client";

import * as React from "react";
import { CheckCircle2, Circle, XCircle, Inbox, Pencil, Plus } from "lucide-react";

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
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { useMaterialRequests } from "@/hooks/use-material-requests";
import { useProjects } from "@/hooks/use-projects";
import { useApprovalRequests } from "@/hooks/use-approval-requests";
import { useAutoConsolidateApprovals } from "@/lib/approvals/use-auto-consolidate-approvals";
import {
  recordApproval,
  revokeApproval,
  rejectApprovalRequest,
} from "@/lib/approvals/approval-request-store";
import { approveBudget } from "@/lib/financial/budget-store";
import { approveEstimate } from "@/lib/estimating/estimate-store";
import { approveChangeOrder } from "@/lib/estimating/change-order-store";
import { showSuccessToast } from "@/lib/toast/toast-store";
import { ApprovalRequestEditDialog } from "@/components/approvals/approval-request-edit-dialog";
import { ALL_APPROVERS, type ApprovalKind, type ApprovalRequest, type ApproverName } from "@/types/approvals";

const KIND_LABEL: Record<ApprovalKind, string> = {
  budget: "Budget",
  estimate: "Quote",
  change_order: "Change Order",
  purchase_order: "Purchase Order",
  material_request: "Material Request",
  manual: "Manual",
};

const KIND_BADGE: Record<ApprovalKind, string> = {
  budget: "bg-primary-soft text-primary",
  estimate: "bg-info-soft text-info-foreground",
  change_order: "bg-warning-soft text-warning-foreground",
  purchase_order: "bg-success-soft text-success",
  material_request: "bg-info-soft text-info-foreground",
  manual: "bg-muted text-muted-foreground",
};

const APPROVER_DATE_FIELD: Record<ApproverName, keyof ApprovalRequest> = {
  Sjaak: "sjaakApprovedDate",
  Carlo: "carloApprovedDate",
  Ben: "benApprovedDate",
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
  const purchaseOrders = usePurchaseOrders();
  const materialRequests = useMaterialRequests();
  const projects = useProjects();
  const requests = useApprovalRequests();
  const [kindFilter, setKindFilter] = React.useState<"all" | ApprovalKind>("all");
  const [editing, setEditing] = React.useState<ApprovalRequest | null>(null);
  const [creating, setCreating] = React.useState(false);

  useAutoConsolidateApprovals(budgets, estimates, changeOrders, purchaseOrders, projects, requests, materialRequests);

  const pending = requests.filter((r) => r.approvalStatus === "pending");
  const filtered = kindFilter === "all" ? pending : pending.filter((r) => r.kind === kindFilter);
  const sorted = [...filtered].sort((a, b) => a.requestedDate.localeCompare(b.requestedDate));

  /** After recording one approver's sign-off, also pushes the source record to "approved" once everyone required has signed off. */
  function handleApprove(request: ApprovalRequest, approver: ApproverName) {
    recordApproval(request.id, approver);

    const alreadyApproved = new Set<ApproverName>(
      ALL_APPROVERS.filter((a) => a === approver || !!request[APPROVER_DATE_FIELD[a]])
    );
    const nowComplete = request.requiredApprovers.every((a) => alreadyApproved.has(a));

    if (nowComplete && request.sourceId) {
      if (request.kind === "budget") approveBudget(request.sourceId, approver);
      else if (request.kind === "estimate") approveEstimate(request.sourceId, approver);
      else if (request.kind === "change_order") approveChangeOrder(request.sourceId, approver);
      // Purchase Orders: bump status via the PO store directly isn't wired
      // here since POs don't have a dedicated approve helper yet — the
      // tracking record itself still reflects full approval.
    }
    showSuccessToast(nowComplete ? `Fully approved (last sign-off: ${approver})` : `${approver} signed off`);
  }

  function handleRevoke(request: ApprovalRequest, approver: ApproverName) {
    revokeApproval(request.id, approver);
  }

  function handleReject(request: ApprovalRequest) {
    rejectApprovalRequest(request.id);
    showSuccessToast("Sent back / rejected");
  }

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Everything currently waiting on sign-off — auto-pulled from Budgets, Quotes, Change
          Orders, and Purchase Orders, plus anything added manually. Budgets and Change Orders
          always need Sjaak, Carlo, and Ben; Quotes and Purchase Orders scale by amount.
        </p>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="size-3.5" /> Manual Entry
        </Button>
      </div>

      <div className="mb-3 flex items-center gap-3">
        <Select value={kindFilter} onValueChange={(v) => setKindFilter(v as typeof kindFilter)}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="budget">Budgets</SelectItem>
            <SelectItem value="estimate">Quotes</SelectItem>
            <SelectItem value="change_order">Change Orders</SelectItem>
            <SelectItem value="purchase_order">Purchase Orders</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{sorted.length} awaiting approval</span>
      </div>

      <div className="flex flex-col gap-3">
        {sorted.map((request) => (
          <Card key={request.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Badge className={`border-transparent ${KIND_BADGE[request.kind]}`}>{KIND_LABEL[request.kind]}</Badge>
                  <span className="font-medium text-foreground">{request.title}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {request.projectName} &middot; Requested by {request.requestedBy} on {formatDate(request.requestedDate)}
                </div>
                {request.notes && <div className="text-xs text-muted-foreground">{request.notes}</div>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-foreground">{formatCurrency(request.amount)}</span>
                <Button variant="ghost" size="icon" onClick={() => setEditing(request)}>
                  <Pencil className="size-3.5" />
                </Button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
              {request.requiredApprovers.map((approver) => {
                const approvedDate = request[APPROVER_DATE_FIELD[approver]] as string | undefined;
                return approvedDate ? (
                  <Button
                    key={approver}
                    size="sm"
                    variant="outline"
                    className="border-success/30 text-success hover:bg-success-soft"
                    onClick={() => handleRevoke(request, approver)}
                    title={`Approved ${formatDate(approvedDate)} — click to undo`}
                  >
                    <CheckCircle2 className="size-3.5" /> {approver}
                  </Button>
                ) : (
                  <Button
                    key={approver}
                    size="sm"
                    variant="outline"
                    onClick={() => handleApprove(request, approver)}
                  >
                    <Circle className="size-3.5" /> {approver}
                  </Button>
                );
              })}
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto text-destructive hover:text-destructive"
                onClick={() => handleReject(request)}
              >
                <XCircle className="size-3.5" /> Send Back
              </Button>
            </div>
          </Card>
        ))}
        {sorted.length === 0 && (
          <Card className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <Inbox className="size-6 opacity-40" />
            Nothing waiting on approval right now.
          </Card>
        )}
      </div>

      <ApprovalRequestEditDialog
        request={editing}
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
      />
      <ApprovalRequestEditDialog
        request={null}
        open={creating}
        onOpenChange={setCreating}
      />
    </>
  );
}
