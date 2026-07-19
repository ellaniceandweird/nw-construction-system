"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BudgetTable } from "@/components/financial/budget-table";
import { CostLedgerTable } from "@/components/financial/cost-ledger-table";
import { InvoicesTable } from "@/components/financial/invoices-table";
import { BillingEntitiesTable } from "@/components/financial/billing-entities-table";
import { FinancialRollupTable } from "@/components/financial/financial-rollup-table";

const VALID_TABS = ["budget", "costledger", "invoices", "billingentities", "rollup"];

export function FinancialPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab");
  const activeTab = VALID_TABS.includes(tabParam ?? "") ? tabParam! : "budget";

  function handleTabChange(value: string) {
    router.push(`${pathname}?tab=${value}`, { scroll: false });
  }

  return (
    <>
      <PageHeader
        title="Financial Tracking"
        description="Budgets, job cost ledger, and vendor invoices across every property."
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="costledger">Cost Ledger</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="billingentities">Billing Entities</TabsTrigger>
          <TabsTrigger value="rollup">Financial Rollup</TabsTrigger>
        </TabsList>
        <TabsContent value="budget">
          <BudgetTable />
        </TabsContent>
        <TabsContent value="costledger">
          <CostLedgerTable />
        </TabsContent>
        <TabsContent value="invoices">
          <InvoicesTable />
        </TabsContent>
        <TabsContent value="billingentities">
          <BillingEntitiesTable />
        </TabsContent>
        <TabsContent value="rollup">
          <FinancialRollupTable />
        </TabsContent>
      </Tabs>

      <p className="mt-4 text-xs text-muted-foreground">
        The 25 Cross Street budget is derived from its real approved estimate. Cost Ledger
        entries from Procurement are pulled in live — nothing is duplicated. Invoices and
        Billing Entities are illustrative and framed as accounts payable, since Nice &amp;
        Weird manages its own properties rather than billing external clients. Change
        Orders live in Estimating &amp; Budgeting, not here, to avoid tracking them twice.
      </p>
    </>
  );
}
