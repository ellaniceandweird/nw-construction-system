"use client";

import * as React from "react";
import { Pencil, Plus } from "lucide-react";

import { useRFQs } from "@/hooks/use-rfqs";
import { MOCK_VENDORS } from "@/lib/data/mock/vendors";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuoteResponseDialog } from "@/components/procurement/quote-response-dialog";
import type { RequestForQuotation, VendorQuoteResponse } from "@/types/procurement";

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function currency(n?: number) {
  if (n == null) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function vendorName(id: string) {
  return MOCK_VENDORS.find((v) => v.id === id)?.vendorName ?? id;
}

function scoreBadgeClass(score?: number) {
  if (score == null) return "bg-muted text-muted-foreground";
  if (score >= 80) return "bg-success-soft text-success";
  if (score >= 50) return "bg-warning-soft text-warning-foreground";
  return "bg-destructive-soft text-destructive";
}

export function QuotesTable() {
  const rfqs = useRFQs();
  const [editing, setEditing] = React.useState<{ rfqId: string; vendorId: string } | null>(null);
  const [adding, setAdding] = React.useState(false);

  const rows = rfqs
    .flatMap((rfq) => rfq.responses.map((resp) => ({ rfq, resp })))
    .sort((a, b) => (b.resp.overallScore ?? 0) - (a.resp.overallScore ?? 0));

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
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Edit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ rfq, resp }: { rfq: RequestForQuotation; resp: VendorQuoteResponse }) => {
              const project = MOCK_PROJECTS.find((p) => p.id === rfq.projectId);
              const isAwarded = rfq.awardedVendorId === resp.vendorId;
              return (
                <tr
                  key={`${rfq.id}-${resp.vendorId}`}
                  className="border-b border-border/60 last:border-0 hover:bg-accent/40"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{rfq.rfqNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{project?.projectName ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground">
                    {vendorName(resp.vendorId)}
                    {isAwarded && (
                      <Badge className="ml-2 bg-success-soft text-success border-transparent">Awarded</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{currency(resp.quotedPrice)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{currency(resp.freight)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{currency(resp.tax)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{resp.leadTimeDays}d</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[10rem]">{resp.warranty ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(resp.submittedDate)}</td>
                  <td className="px-4 py-3">
                    <Badge className={`${scoreBadgeClass(resp.overallScore)} border-transparent`}>
                      {resp.overallScore ?? "—"}
                    </Badge>
                  </td>
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
                <td colSpan={11} className="px-4 py-6 text-center text-muted-foreground">
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
