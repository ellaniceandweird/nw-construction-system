"use client";
import * as React from "react";
import { Sparkles, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDailyLogs } from "@/hooks/use-daily-logs";
import { useFieldWorkerRates } from "@/hooks/use-field-worker-rates";
import { useProperties } from "@/hooks/use-properties";
import { useProjects } from "@/hooks/use-projects";
import { generateFieldWorkerInvoices } from "@/lib/field-operations/field-worker-invoice-generation";
import { saveFieldWorkerInvoices } from "@/lib/field-operations/field-worker-invoice-store";
import type { FieldWorkerInvoiceDraft } from "@/lib/field-operations/field-worker-invoice-store";

interface Props { open: boolean; onOpenChange: (open: boolean) => void; }

function currency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function GenerateInvoicesDialog({ open, onOpenChange }: Props) {
  const dailyLogs = useDailyLogs();
  const rates = useFieldWorkerRates();
  const properties = useProperties();
  const projects = useProjects();

  const [payPeriodStart, setPayPeriodStart] = React.useState("");
  const [payPeriodEnd, setPayPeriodEnd] = React.useState("");
  const [preview, setPreview] = React.useState<FieldWorkerInvoiceDraft[] | null>(null);
  const [saved, setSaved] = React.useState(false);

  function reset() {
    setPayPeriodStart("");
    setPayPeriodEnd("");
    setPreview(null);
    setSaved(false);
  }

  function handlePreview() {
    if (!payPeriodStart || !payPeriodEnd) return;
    const drafts = generateFieldWorkerInvoices(dailyLogs, rates, properties, projects, {
      payPeriodStart,
      payPeriodEnd,
    });
    setPreview(drafts);
  }

  function handleSave() {
    if (!preview) return;
    saveFieldWorkerInvoices(preview);
    setSaved(true);
  }

  const missingRateCount = preview?.filter((inv) => inv.lineItems.some((li) => li.regularRate === 0)).length ?? 0;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next); }}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Field Worker Invoices</DialogTitle>
          <DialogDescription>
            Pulls real crew hours from Daily Logs for the pay period you choose, and rates
            from References &gt; Field Worker Rates. Nothing saves until you review and confirm.
          </DialogDescription>
        </DialogHeader>

        {!saved && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="payPeriodStart">Pay Period Start</Label><Input id="payPeriodStart" type="date" className="mt-1.5" value={payPeriodStart} onChange={(e) => setPayPeriodStart(e.target.value)} /></div>
              <div><Label htmlFor="payPeriodEnd">Pay Period End</Label><Input id="payPeriodEnd" type="date" className="mt-1.5" value={payPeriodEnd} onChange={(e) => setPayPeriodEnd(e.target.value)} /></div>
            </div>
            <Button variant="outline" onClick={handlePreview} disabled={!payPeriodStart || !payPeriodEnd}>
              <Sparkles className="size-3.5" /> Preview Invoices
            </Button>

            {preview && (
              <div className="flex flex-col gap-3">
                {preview.length === 0 ? (
                  <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                    No crew hours found in that pay period.
                  </p>
                ) : (
                  <>
                    {missingRateCount > 0 && (
                      <p className="flex items-start gap-2 rounded-lg bg-warning-soft p-3 text-sm text-warning-foreground">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                        {missingRateCount} worker{missingRateCount === 1 ? " has" : "s have"} no rate on file in
                        References — their line items will show $0 until a rate is added.
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">{preview.length} invoice{preview.length === 1 ? "" : "s"} will be created:</p>
                    <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
                      {preview.map((inv) => (
                        <div key={inv.employeeId} className="flex items-center justify-between rounded-md border border-border p-2.5 text-sm">
                          <div>
                            <p className="font-medium text-foreground">{inv.employeeName}</p>
                            <p className="text-xs text-muted-foreground">{inv.trade} · {inv.lineItems.length} day{inv.lineItems.length === 1 ? "" : "s"} · {inv.totalHours.toFixed(1)} hrs</p>
                          </div>
                          <span className={`font-medium ${inv.lineItems.some((li) => li.regularRate === 0) ? "text-warning-foreground" : "text-foreground"}`}>
                            {currency(inv.totalAmount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {saved && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="text-lg font-semibold text-success">Invoices generated</p>
            <p className="text-sm text-muted-foreground">Created {preview?.length ?? 0} invoice{(preview?.length ?? 0) === 1 ? "" : "s"}.</p>
          </div>
        )}

        <DialogFooter>
          {!saved && preview && preview.length > 0 && (
            <Button onClick={handleSave}>Save {preview.length} Invoice{preview.length === 1 ? "" : "s"}</Button>
          )}
          {saved && <Button onClick={() => onOpenChange(false)}>Done</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
