"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CostLedgerTable } from "@/components/financial/cost-ledger-table";
import { FinancialRollupTable } from "@/components/financial/financial-rollup-table";

const VALID_TABS = ["costledger", "rollup"];

export function FinancialPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab");
  const activeTab = VALID_TABS.includes(tabParam ?? "") ? tabParam! : "costledger";

  function handleTabChange(value: string) {
    router.push(`${pathname}?tab=${value}`, { scroll: false });
  }

  return (
    <>
      <PageHeader
        title="Financial Tracking"
        description="Job cost ledger and financial rollup across every property."
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="costledger">Cost Ledger</TabsTrigger>
          <TabsTrigger value="rollup">Financial Rollup</TabsTrigger>
        </TabsList>
        <TabsContent value="costledger">
          <CostLedgerTable />
        </TabsContent>
        <TabsContent value="rollup">
          <FinancialRollupTable />
        </TabsContent>
      </Tabs>

      <p className="mt-4 text-xs text-muted-foreground">
        Budget lives on each Project record, Billing Entities and Cost Codes live in
        References, and Change Orders live in Estimating &amp; Budgeting — kept here to
        just Cost Ledger and Rollup so nothing is tracked in two places at once.
      </p>
    </>
  );
}
