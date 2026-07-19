"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FieldWorkerRatesTable } from "@/components/references/field-worker-rates-table";
import { USHolidaysTable } from "@/components/references/us-holidays-table";
import { BillingEntitiesTable } from "@/components/financial/billing-entities-table";
import { CostCodesTable } from "@/components/estimating/cost-codes-table";
import { PrintSettingsCard } from "@/components/admin/print-settings-card";

const VALID_TABS = ["fieldworkerrates", "holidays", "billingentities", "costcodes", "printsettings"];

export function ReferencesPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab");
  const activeTab = VALID_TABS.includes(tabParam ?? "") ? tabParam! : "fieldworkerrates";

  function handleTabChange(value: string) {
    router.push(`${pathname}?tab=${value}`, { scroll: false });
  }

  return (
    <>
      <PageHeader
        title="References"
        description="The source of truth for rates, holidays, billing entities, cost codes, and print settings — other modules read from here."
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="fieldworkerrates">Field Worker Rates</TabsTrigger>
          <TabsTrigger value="holidays">US Holidays</TabsTrigger>
          <TabsTrigger value="billingentities">Billing Entities</TabsTrigger>
          <TabsTrigger value="costcodes">Cost Codes</TabsTrigger>
          <TabsTrigger value="printsettings">Print Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="fieldworkerrates">
          <FieldWorkerRatesTable />
        </TabsContent>
        <TabsContent value="holidays">
          <USHolidaysTable />
        </TabsContent>
        <TabsContent value="billingentities">
          <BillingEntitiesTable />
        </TabsContent>
        <TabsContent value="costcodes">
          <CostCodesTable />
        </TabsContent>
        <TabsContent value="printsettings">
          <PrintSettingsCard />
        </TabsContent>
      </Tabs>

      <p className="mt-4 text-xs text-muted-foreground">
        Billing Entities and Cost Codes here are the exact same data as Financial
        Tracking and Estimating &amp; Budgeting — editing one updates the other
        automatically, since they share one store rather than keeping separate copies.
      </p>
    </>
  );
}
