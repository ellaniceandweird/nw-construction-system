"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ForecastTable } from "@/components/procurement/forecast-table";
import { MaterialRequestsTable } from "@/components/procurement/material-requests-table";
import { RfqsTable } from "@/components/procurement/rfqs-table";
import { QuotesTable } from "@/components/procurement/quotes-table";
import { SubcontractorSourcingTable } from "@/components/procurement/subcontractor-sourcing-table";
import { QuoteComparison } from "@/components/procurement/quote-comparison";
import { PurchaseOrdersTable } from "@/components/procurement/purchase-orders-table";
import { VendorsTable } from "@/components/procurement/vendors-table";
import { SubcontractorsTable } from "@/components/procurement/subcontractors-table";

const VALID_TABS = [
  "forecast",
  "sourcing",
  "pos",
  "vendors",
  "subcontractors",
];

const SOURCING_SUB_TABS = [
  { value: "mrs", label: "Material Request" },
  { value: "subcontractor-sourcing", label: "Subcontractor Sourcing" },
  { value: "rfqs", label: "RFQs" },
  { value: "quotes", label: "Quotes" },
  { value: "comparison", label: "Quote Comparison" },
] as const;

export function ProcurementPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab");
  const activeTab = VALID_TABS.includes(tabParam ?? "") ? tabParam! : "forecast";

  // Local state, not URL-driven — avoids nesting a second URL-controlled
  // Tabs instance inside the outer one, which was making these buttons
  // unclickable.
  const [activeSourcingTab, setActiveSourcingTab] = React.useState<string>("mrs");

  function handleTabChange(value: string) {
    router.push(`${pathname}?tab=${value}`, { scroll: false });
  }

  return (
    <>
      <PageHeader
        title="Procurement"
        description="Material forecasting, sourcing, purchase orders, vendors, and subcontractors across every project."
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="sourcing">Sourcing</TabsTrigger>
          <TabsTrigger value="pos">Purchase Order</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="subcontractors">Subcontractor</TabsTrigger>
        </TabsList>
        <TabsContent value="forecast">
          <ForecastTable />
        </TabsContent>
        <TabsContent value="sourcing">
          <p className="mb-3 text-xs text-muted-foreground">
            Material Request, RFQs, Quotes, and Quote Comparison — the day-to-day sourcing
            workflow, grouped together since these all feed into each other.
          </p>
          <div className="mb-4 inline-flex items-center gap-1 rounded-lg bg-muted p-1 text-muted-foreground">
            {SOURCING_SUB_TABS.map((t) => (
              <Button
                key={t.value}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActiveSourcingTab(t.value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium hover:bg-transparent",
                  activeSourcingTab === t.value
                    ? "bg-card text-foreground shadow-sm hover:bg-card"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </Button>
            ))}
          </div>
          {activeSourcingTab === "mrs" && <MaterialRequestsTable />}
          {activeSourcingTab === "subcontractor-sourcing" && <SubcontractorSourcingTable />}
          {activeSourcingTab === "rfqs" && <RfqsTable />}
          {activeSourcingTab === "quotes" && <QuotesTable />}
          {activeSourcingTab === "comparison" && <QuoteComparison />}
        </TabsContent>
        <TabsContent value="pos">
          <PurchaseOrdersTable />
        </TabsContent>
        <TabsContent value="vendors">
          <VendorsTable />
        </TabsContent>
        <TabsContent value="subcontractors">
          <SubcontractorsTable />
        </TabsContent>
      </Tabs>

      <p className="mt-4 text-xs text-muted-foreground">
        Vendor, subcontractor, RFQ, quote, and purchase order data shown here
        is illustrative — your source workbook doesn&apos;t yet track
        procurement transactions. Real data will replace this once
        Excel/Procurement integration is built (Phase 8).
      </p>
    </>
  );
}
