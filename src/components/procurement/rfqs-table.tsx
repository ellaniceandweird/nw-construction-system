"use client";

import * as React from "react";
import { Pencil, Plus, FileText, Upload, Mail, ArrowUpDown } from "lucide-react";

import { useRFQs } from "@/hooks/use-rfqs";
import { getRFQStatus } from "@/lib/procurement/rfq-store";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { useVendors } from "@/hooks/use-vendors";
import type { Vendor } from "@/types/procurement";
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
import { RfqCreateDialog } from "@/components/procurement/rfq-create-dialog";
import { RfqEditDialog } from "@/components/procurement/rfq-edit-dialog";
import { QuoteResponseDialog } from "@/components/procurement/quote-response-dialog";
import { ImportQuoteDialog } from "@/components/procurement/import-quote-dialog";
import { RfqEmailPreviewDialog } from "@/components/procurement/rfq-email-preview-dialog";
import type { RequestForQuotation } from "@/types/procurement";

const STATUS_CLASS: Record<string, string> = {
  open: "bg-muted text-muted-foreground",
  partial: "bg-warning-soft text-warning-foreground",
  quoted: "bg-info-soft text-info-foreground",
  awarded: "bg-success-soft text-success",
  closed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive-soft text-destructive",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function vendorName(id: string, vendors: Vendor[]) {
  return vendors.find((v) => v.id === id)?.vendorName ?? id;
}

export function RfqsTable() {
  const rfqs = useRFQs();
  const vendors = useVendors();
  const [creating, setCreating] = React.useState(false);
  const [editingRfq, setEditingRfq] = React.useState<RequestForQuotation | null>(null);
  const [quotingRfq, setQuotingRfq] = React.useState<RequestForQuotation | null>(null);
  const [uploadingRfq, setUploadingRfq] = React.useState<RequestForQuotation | null>(null);
  const [emailingRfq, setEmailingRfq] = React.useState<RequestForQuotation | null>(null);
  const [projectFilter, setProjectFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<"due_asc" | "due_desc">("due_asc");

  const filtered = rfqs.filter((r) => projectFilter === "all" || r.projectId === projectFilter);
  const sorted = [...filtered].sort((a, b) =>
    sortBy === "due_asc"
      ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
  );

  return (
    <>
      <div className="mb-3 flex justify-end">
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="size-3.5" /> New RFQ
        </Button>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Projects" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {MOCK_PROJECTS.map((p) => (<SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[170px]"><ArrowUpDown className="size-3.5 text-muted-foreground" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="due_asc">Due Date (Soonest)</SelectItem>
            <SelectItem value="due_desc">Due Date (Latest)</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{sorted.length} of {rfqs.length}</span>
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">RFQ Number</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Material List</th>
              <th className="px-4 py-3 font-medium">Vendors Invited</th>
              <th className="px-4 py-3 font-medium">Due Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Quotes</th>
              <th className="px-4 py-3 font-medium">Edit</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const project = MOCK_PROJECTS.find((p) => p.id === r.projectId);
              const rfqStatus = getRFQStatus(r);
              return (
                <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                  <td className="px-4 py-3 font-medium text-foreground">{r.rfqNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{project?.projectName ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs">{r.materialList}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.vendorIds.map((id) => vendorName(id, vendors)).join(", ")}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(r.dueDate)}</td>
                  <td className="px-4 py-3">
                    <Badge className={`${STATUS_CLASS[rfqStatus]} border-transparent`}>
                      {rfqStatus === "awarded"
                        ? `Awarded — ${vendorName(r.awardedVendorId!, vendors)}`
                        : rfqStatus === "cancelled" || rfqStatus === "closed"
                          ? rfqStatus.charAt(0).toUpperCase() + rfqStatus.slice(1)
                          : `${r.responses.length}/${r.vendorIds.length} ${rfqStatus}`}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setQuotingRfq(r)}>
                        <FileText className="size-3.5" /> Log Quote
                      </Button>
                      <Button variant="ghost" size="icon" title="Upload Quote PDF" onClick={() => setUploadingRfq(r)}>
                        <Upload className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Send Quote Request Email" onClick={() => setEmailingRfq(r)}>
                        <Mail className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" onClick={() => setEditingRfq(r)}>
                      <Pencil className="size-3.5" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <RfqCreateDialog open={creating} onOpenChange={setCreating} />
      <RfqEditDialog
        rfq={editingRfq}
        open={!!editingRfq}
        onOpenChange={(open) => !open && setEditingRfq(null)}
      />
      <QuoteResponseDialog
        initialRfqId={quotingRfq?.id}
        open={!!quotingRfq}
        onOpenChange={(open) => !open && setQuotingRfq(null)}
      />
      <ImportQuoteDialog
        open={!!uploadingRfq}
        onOpenChange={(open) => !open && setUploadingRfq(null)}
        initialRfqId={uploadingRfq?.id}
      />
      <RfqEmailPreviewDialog
        rfq={emailingRfq}
        open={!!emailingRfq}
        onOpenChange={(open) => !open && setEmailingRfq(null)}
      />
    </>
  );
}
