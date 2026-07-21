"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ForecastTable } from "@/components/procurement/forecast-table";
import { MaterialRequestsTable } from "@/components/procurement/material-requests-table";
import { RfqsTable } from "@/components/procurement/rfqs-table";
import { QuotesTable } from "@/components/procurement/quotes-table";
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

const SOURCING_SUB_TABS = ["mrs", "rfqs", "quotes", "comparison"];

export function ProcurementPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab");
  const activeTab = VALID_TABS.includes(tabParam ?? "") ? tabParam! : "forecast";

  const subTabParam = searchParams.get("sourcing");
  const activeSourcingTab = SOURCING_SUB_TABS.includes(subTabParam ?? "") ? subTabParam! : "mrs";

  function handleTabChange(value: string) {
    router.push(`${pathname}?tab=${value}`, { scroll: false });
  }

  function handleSourcingTabChange(value: string) {
    router.push(`${pathname}?tab=sourcing&sourcing=${value}`, { scroll: false });
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
          <Tabs value={activeSourcingTab} onValueChange={handleSourcingTabChange}>
            <TabsList>
              <TabsTrigger value="mrs">Material Request</TabsTrigger>
              <TabsTrigger value="rfqs">RFQs</TabsTrigger>
              <TabsTrigger value="quotes">Quotes</TabsTrigger>
              <TabsTrigger value="comparison">Quote Comparison</TabsTrigger>
            </TabsList>
            <TabsContent value="mrs">
              <MaterialRequestsTable />
            </TabsContent>
            <TabsContent value="rfqs">
              <RfqsTable />
            </TabsContent>
            <TabsContent value="quotes">
              <QuotesTable />
            </TabsContent>
            <TabsContent value="comparison">
              <QuoteComparison />
            </TabsContent>
          </Tabs>
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
