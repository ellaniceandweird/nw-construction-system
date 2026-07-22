"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EstimatesTable } from "@/components/estimating/estimates-table";
import { CostDatabaseTable } from "@/components/estimating/cost-database-table";
import { CostTrackingTable } from "@/components/estimating/cost-tracking-table";
import { ChangeOrdersTable } from "@/components/estimating/change-orders-table";
import { PortfolioRollupTable } from "@/components/estimating/portfolio-rollup-table";

const VALID_TABS = ["estimates", "costdatabase", "costtracking", "changeorders", "portfolio"];

export function EstimatingPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab");
  const activeTab = VALID_TABS.includes(tabParam ?? "") ? tabParam! : "estimates";

  function handleTabChange(value: string) {
    router.push(`${pathname}?tab=${value}`, { scroll: false });
  }

  return (
    <>
      <PageHeader
        title="Estimating & Budgeting"
        description="Estimate builder, cost tracking, and change orders across every project."
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="print:hidden">
          <TabsTrigger value="estimates">Estimates</TabsTrigger>
          <TabsTrigger value="costdatabase">Cost Database</TabsTrigger>
          <TabsTrigger value="costtracking">Cost Tracking</TabsTrigger>
          <TabsTrigger value="changeorders">Change Orders</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio Rollup</TabsTrigger>
        </TabsList>
        <TabsContent value="estimates">
          <EstimatesTable />
        </TabsContent>
        <TabsContent value="costdatabase">
          <CostDatabaseTable />
        </TabsContent>
        <TabsContent value="costtracking">
          <CostTrackingTable />
        </TabsContent>
        <TabsContent value="changeorders">
          <ChangeOrdersTable />
        </TabsContent>
        <TabsContent value="portfolio">
          <PortfolioRollupTable />
        </TabsContent>
      </Tabs>

      <p className="mt-4 text-xs text-muted-foreground print:hidden">
        The 25 Cross Street estimate is transcribed from your uploaded budget workbook;
        the other two are illustrative. Cost Codes now live in References, since they're
        shared across the whole app rather than specific to estimating. Change Orders
        adjust the Revised Budget shown in Cost Tracking and Portfolio Rollup. Print
        Estimate (from the Estimates tab) for a clean internal document.
      </p>
    </>
  );
}
