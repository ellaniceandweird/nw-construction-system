"use client";

import * as React from "react";
import { Trophy } from "lucide-react";

import { useRFQs } from "@/hooks/use-rfqs";
import { awardRFQ } from "@/lib/procurement/rfq-store";
import { MOCK_VENDORS } from "@/lib/data/mock/vendors";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
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

function currency(n?: number) {
  if (n == null) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function vendorName(id: string) {
  return MOCK_VENDORS.find((v) => v.id === id)?.vendorName ?? id;
}

export function QuoteComparison() {
  const rfqs = useRFQs();
  const withQuotes = rfqs.filter((r) => r.responses.length > 0);
  const [selectedId, setSelectedId] = React.useState<string>(withQuotes[0]?.id ?? "");

  React.useEffect(() => {
    if (!selectedId && withQuotes.length > 0) setSelectedId(withQuotes[0].id);
  }, [withQuotes, selectedId]);

  const rfq = rfqs.find((r) => r.id === selectedId);
  const project = rfq ? MOCK_PROJECTS.find((p) => p.id === rfq.projectId) : undefined;

  if (withQuotes.length === 0) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        No RFQs have quotes logged yet. Log a quote from the RFQs tab to compare vendors here.
      </Card>
    );
  }

  const responses = rfq?.responses ?? [];
  const lowestPrice = responses.length ? Math.min(...responses.map((r) => r.quotedPrice)) : undefined;
  const shortestLead = responses.length ? Math.min(...responses.map((r) => r.leadTimeDays)) : undefined;
  const bestScore = responses.length
    ? Math.max(...responses.map((r) => r.overallScore ?? 0))
    : undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-80">
            <SelectValue placeholder="Select an RFQ" />
          </SelectTrigger>
          <SelectContent>
            {withQuotes.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.rfqNumber} — {MOCK_PROJECTS.find((p) => p.id === r.projectId)?.projectName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {rfq?.awardedVendorId && (
          <Badge className="bg-success-soft text-success border-transparent">
            Awarded to {vendorName(rfq.awardedVendorId)}
          </Badge>
        )}
      </div>

      {rfq && (
        <>
          <p className="text-sm text-muted-foreground">
            {project?.projectName} — {rfq.materialList}
          </p>

          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${responses.length}, minmax(220px, 1fr))` }}
          >
            {responses.map((resp) => {
              const isAwarded = rfq.awardedVendorId === resp.vendorId;
              const isBestPrice = resp.quotedPrice === lowestPrice;
              const isBestLead = resp.leadTimeDays === shortestLead;
              const isBestScore = (resp.overallScore ?? 0) === bestScore;
              return (
                <Card key={resp.vendorId} className={`p-4 ${isAwarded ? "ring-2 ring-success" : ""}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-medium text-foreground">{vendorName(resp.vendorId)}</h3>
                    {isBestScore && <Trophy className="size-4 text-success" />}
                  </div>

                  <dl className="flex flex-col gap-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Price</dt>
                      <dd className={isBestPrice ? "font-semibold text-success" : "text-foreground"}>
                        {currency(resp.quotedPrice)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Freight</dt>
                      <dd className="text-foreground">{currency(resp.freight)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Tax</dt>
                      <dd className="text-foreground">{currency(resp.tax)}</dd>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2">
                      <dt className="text-muted-foreground">Landed Total</dt>
                      <dd className="font-medium text-foreground">
                        {currency(resp.quotedPrice + (resp.freight ?? 0) + (resp.tax ?? 0))}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Lead Time</dt>
                      <dd className={isBestLead ? "font-semibold text-success" : "text-foreground"}>
                        {resp.leadTimeDays} days
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Warranty</dt>
                      <dd className="text-foreground">{resp.warranty ?? "—"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Quote Valid</dt>
                      <dd className="text-foreground">
                        {resp.validityPeriodDays ? `${resp.validityPeriodDays} days` : "—"}
                      </dd>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2">
                      <dt className="text-muted-foreground">Score</dt>
                      <dd className={isBestScore ? "font-semibold text-success" : "text-foreground"}>
                        {resp.overallScore ?? "—"} / 100
                      </dd>
                    </div>
                  </dl>

                  {resp.notes && <p className="mt-3 text-xs text-muted-foreground">{resp.notes}</p>}

                  <Button
                    className="mt-4 w-full"
                    size="sm"
                    variant={isAwarded ? "outline" : "default"}
                    onClick={() => awardRFQ(rfq.id, isAwarded ? undefined : resp.vendorId)}
                  >
                    {isAwarded ? "Remove Award" : "Award This Vendor"}
                  </Button>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
