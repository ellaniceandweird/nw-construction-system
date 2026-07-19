"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EstimatesTable } from "@/components/estimating/estimates-table";
import { TakeoffTable } from "@/components/estimating/takeoff-table";
import { CostCodesTable } from "@/components/estimating/cost-codes-table";
import { CostDatabaseTable } from "@/components/estimating/cost-database-table";
import { CostTrackingTable } from "@/components/estimating/cost-tracking-table";
import { ChangeOrdersTable } from "@/components/estimating/change-orders-table";
import { PortfolioRollupTable } from "@/components/estimating/portfolio-rollup-table";

const VALID_TABS = ["estimates", "takeoff", "costcodes", "costdatabase", "costtracking", "changeorders", "portfolio"];

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
        description="Cost breakdown structure, quantity takeoffs, and estimate builder across every project."
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="print:hidden">
          <TabsTrigger value="estimates">Estimates</TabsTrigger>
          <TabsTrigger value="takeoff">Takeoff</TabsTrigger>
          <TabsTrigger value="costcodes">Cost Codes</TabsTrigger>
          <TabsTrigger value="costdatabase">Cost Database</TabsTrigger>
          <TabsTrigger value="costtracking">Cost Tracking</TabsTrigger>
          <TabsTrigger value="changeorders">Change Orders</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio Rollup</TabsTrigger>
        </TabsList>
        <TabsContent value="estimates">
          <EstimatesTable />
        </TabsContent>
        <TabsContent value="takeoff">
          <TakeoffTable />
        </TabsContent>
        <TabsContent value="costcodes">
          <CostCodesTable />
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
        the other two are illustrative. Takeoff quantities tagged with a Forecast Material
        Match automatically feed Procurement&apos;s Forecast tab. Change Orders adjust the
        Revised Budget shown in Cost Tracking and Portfolio Rollup. Print Estimate (from
        the Estimates tab) for a clean internal document.
      </p>
    </>
  );
}
