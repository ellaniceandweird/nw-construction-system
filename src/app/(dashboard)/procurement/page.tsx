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

export default function ProcurementPage() {
  return (
    <>
      <PageHeader
        title="Procurement"
        description="Material forecasting, requests, RFQs, vendor quotes, purchase orders, vendors, and subcontractors across every project."
      />

      <Tabs defaultValue="forecast">
        <TabsList>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="mrs">Material Request</TabsTrigger>
          <TabsTrigger value="rfqs">RFQs</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="comparison">Quote Comparison</TabsTrigger>
          <TabsTrigger value="pos">Purchase Order</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="subcontractors">Subcontractor</TabsTrigger>
        </TabsList>
        <TabsContent value="forecast">
          <ForecastTable />
        </TabsContent>
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
