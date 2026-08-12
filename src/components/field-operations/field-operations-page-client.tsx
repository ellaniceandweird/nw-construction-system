"use client";

import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DailyLogsList } from "@/components/field-operations/daily-logs-list";
import { FieldWorkerInvoicesTable } from "@/components/field-operations/field-worker-invoices-table";

const VALID_TABS = ["dailylogs", "invoices"];

export function FieldOperationsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab");
  const activeTab = VALID_TABS.includes(tabParam ?? "") ? tabParam! : "dailylogs";

  function handleTabChange(value: string) {
    router.push(`${pathname}?tab=${value}`, { scroll: false });
  }

  return (
    <>
      <PageHeader
        title="Daily Logs"
        description="Real field activity from crew attendance, hours worked, and daily progress across every project."
        actions={
          activeTab === "dailylogs" ? (
            <Button asChild>
              <Link href="/field-operations/new">
                <Plus /> New Daily Log
              </Link>
            </Button>
          ) : undefined
        }
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="dailylogs">Daily Logs</TabsTrigger>
          <TabsTrigger value="invoices">Field Worker Invoices</TabsTrigger>
        </TabsList>
        <TabsContent value="dailylogs">
          <DailyLogsList />
        </TabsContent>
        <TabsContent value="invoices">
          <FieldWorkerInvoicesTable />
        </TabsContent>
      </Tabs>
    </>
  );
}
