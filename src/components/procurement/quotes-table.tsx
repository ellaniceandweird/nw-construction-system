"use client";

import * as React from "react";
import { Pencil, Plus, ArrowUpDown } from "lucide-react";

import { useRFQs } from "@/hooks/use-rfqs";
import { useVendors } from "@/hooks/use-vendors";
import type { Vendor } from "@/types/procurement";
import { useProjects } from "@/hooks/use-projects";
import { getRequiredApprovers } from "@/lib/procurement/quote-approval";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuoteResponseDialog } from "@/components/procurement/quote-response-dialog";
import type { RequestForQuotation, VendorQuoteResponse } from "@/types/procurement";

const STATUS_CLASS: Record<string, string> = {
  pending_approval: "bg-warning-soft text-warning-foreground",
  rejected: "bg-destructive-soft text-destructive",
  awarded: "bg-success-soft text-success",
};
const STATUS_LABEL: Record<string, string> = {
  pending_approval: "Pending Approval",
  rejected: "Rejected",
  awarded: "Awarded",
};

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function currency(n?: number) {
  if (n == null) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function vendorName(id: string, vendors: Vendor[]) {
  return vendors.find((v) => v.id === id)?.vendorName ?? id;
}

export function QuotesTable() {
  const projects = useProjects();
  const rfqs = useRFQs();
  const vendors = useVendors();
  const [editing, setEditing] = React.useState<{ rfqId: string; vendorId: string } | null>(null);
  const [adding, setAdding] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<"date_desc" | "date_asc" | "price_desc" | "price_asc">("date_desc");

  const allRows = rfqs.flatMap((rfq) => rfq.responses.map((resp) => ({ rfq, resp })));
  const filtered = allRows.filter(({ rfq, resp }) => {
    if (statusFilter === "all") return true;
    const isAwarded = rfq.awardedVendorId === resp.vendorId;
    const status = isAwarded ? "awarded" : resp.quoteStatus ?? "pending_approval";
    return status === statusFilter;
  });
  const rows = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "date_asc":
        return (a.resp.submittedDate ?? "").localeCompare(b.resp.submittedDate ?? "");
      case "price_desc":
        return b.resp.quotedPrice - a.resp.quotedPrice;
      case "price_asc":
        return a.resp.quotedPrice - b.resp.quotedPrice;
      default:
        return (b.resp.submittedDate ?? "").localeCompare(a.resp.submittedDate ?? "");
    }
  });

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Generated from quotes logged on the RFQs tab (manual entry or PDF upload there).
          Use &quot;Add Quote&quot; here as a fallback if a PDF upload's parsing goes wrong
          or you just want to enter one directly.
        </p>
        <Button size="sm" onClick={() => setAdding(true)} className="shrink-0">
          <Plus className="size-3.5" /> Add Quote
        </Button>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending_approval">Pending Approval</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="awarded">Awarded</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[170px]"><ArrowUpDown className="size-3.5 text-muted-foreground" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">Received (Newest)</SelectItem>
            <SelectItem value="date_asc">Received (Oldest)</SelectItem>
            <SelectItem value="price_desc">Price (Highest)</SelectItem>
            <SelectItem value="price_asc">Price (Lowest)</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{rows.length} of {allRows.length}</span>
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">RFQ Number</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Vendor</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Freight</th>
              <th className="px-4 py-3 font-medium">Tax</th>
              <th className="px-4 py-3 font-medium">Lead Time</th>
              <th className="px-4 py-3 font-medium">Warranty</th>
              <th className="px-4 py-3 font-medium">Received</th>
              <th className="px-4 py-3 font-medium">Notes</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Approval</th>
              <th className="px-4 py-3 font-medium">Edit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ rfq, resp }: { rfq: RequestForQuotation; resp: VendorQuoteResponse }) => {
              const project = projects.find((p) => p.id === rfq.projectId);
              const isAwarded = rfq.awardedVendorId === resp.vendorId;
              const status = isAwarded ? "awarded" : resp.quoteStatus ?? "pending_approval";
              const totalCost = resp.quotedPrice + (resp.freight ?? 0) + (resp.tax ?? 0);
              return (
                <tr
                  key={`${rfq.id}-${resp.vendorId}`}
                  className="border-b border-border/60 last:border-0 hover:bg-accent/40"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{rfq.rfqNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{project?.projectName ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground">{vendorName(resp.vendorId, vendors)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{currency(resp.quotedPrice)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{currency(resp.freight)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{currency(resp.tax)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{resp.leadTimeDays}d</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[10rem]">{resp.warranty ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(resp.submittedDate)}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[12rem] truncate" title={resp.notes}>{resp.notes ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge className={`${STATUS_CLASS[status]} border-transparent`}>{STATUS_LABEL[status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{getRequiredApprovers(totalCost)}</td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditing({ rfqId: rfq.id, vendorId: resp.vendorId })}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={13} className="px-4 py-6 text-center text-muted-foreground">
                  No quotes logged yet — add one from the RFQs tab, or use &quot;Add Quote&quot; above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <QuoteResponseDialog
        initialRfqId={editing?.rfqId}
        vendorId={editing?.vendorId}
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
      />
      <QuoteResponseDialog open={adding} onOpenChange={setAdding} />
    </>
  );
}
