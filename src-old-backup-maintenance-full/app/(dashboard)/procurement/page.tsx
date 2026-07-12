import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PurchaseOrdersTable } from "@/components/procurement/purchase-orders-table";
import { VendorsTable } from "@/components/procurement/vendors-table";
import { MaterialRequestsTable } from "@/components/procurement/material-requests-table";

export default function ProcurementPage() {
  return (
    <>
      <PageHeader
        title="Procurement"
        description="Material requests, vendors, and purchase orders across every project."
      />

      <Tabs defaultValue="pos">
        <TabsList>
          <TabsTrigger value="pos">Purchase Orders</TabsTrigger>
          <TabsTrigger value="mrs">Material Requests</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
        </TabsList>
        <TabsContent value="pos">
          <PurchaseOrdersTable />
        </TabsContent>
        <TabsContent value="mrs">
          <MaterialRequestsTable />
        </TabsContent>
        <TabsContent value="vendors">
          <VendorsTable />
        </TabsContent>
      </Tabs>

      <p className="mt-4 text-xs text-muted-foreground">
        Vendor and purchase order data shown here is illustrative — your source
        workbook doesn&apos;t yet track procurement transactions. Real data will
        replace this once Excel/Procurement integration is built (Phase 8).
      </p>
    </>
  );
}
