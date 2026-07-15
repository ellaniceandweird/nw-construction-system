"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DocumentsTable } from "@/components/documents/documents-table";
import { DrawingsTable } from "@/components/documents/drawings-table";
import { RfisTable } from "@/components/documents/rfis-table";
import { SubmittalsTable } from "@/components/documents/submittals-table";

const VALID_TABS = ["documents", "drawings", "rfis", "submittals"];

export function DocumentsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab");
  const activeTab = VALID_TABS.includes(tabParam ?? "") ? tabParam! : "documents";

  function handleTabChange(value: string) {
    router.push(`${pathname}?tab=${value}`, { scroll: false });
  }

  return (
    <>
      <PageHeader
        title="Documents"
        description="Document registry, drawings, RFIs, and submittals across every property."
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="drawings">Drawings</TabsTrigger>
          <TabsTrigger value="rfis">RFIs</TabsTrigger>
          <TabsTrigger value="submittals">Submittals</TabsTrigger>
        </TabsList>
        <TabsContent value="documents">
          <DocumentsTable />
        </TabsContent>
        <TabsContent value="drawings">
          <DrawingsTable />
        </TabsContent>
        <TabsContent value="rfis">
          <RfisTable />
        </TabsContent>
        <TabsContent value="submittals">
          <SubmittalsTable />
        </TabsContent>
      </Tabs>

      <p className="mt-4 text-xs text-muted-foreground">
        All illustrative but grounded in real properties — Documents and Drawings link out
        to wherever files actually live rather than storing them here. Meeting Minutes and
        a dedicated Photo library aren&apos;t built yet (photos already live in Field
        Operations&apos; daily logs); let me know if you&apos;d like those added too.
      </p>
    </>
  );
}
