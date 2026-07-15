"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DocumentsTable } from "@/components/documents/documents-table";
import { DrawingsTable } from "@/components/documents/drawings-table";
import { PhotosTable } from "@/components/documents/photos-table";

const VALID_TABS = ["documents", "drawings", "photos"];

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
        description="Document registry, drawings, and photos across every property."
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="drawings">Drawings</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
        </TabsList>
        <TabsContent value="documents">
          <DocumentsTable />
        </TabsContent>
        <TabsContent value="drawings">
          <DrawingsTable />
        </TabsContent>
        <TabsContent value="photos">
          <PhotosTable />
        </TabsContent>
      </Tabs>

      <p className="mt-4 text-xs text-muted-foreground">
        All illustrative but grounded in real properties. Documents, Drawings, and Photos
        all link out to Google Drive rather than storing files here — use &quot;Browse
        Google Drive&quot; to pick files visually instead of pasting links by hand (needs
        a one-time Google Cloud setup — see .env.local.example).
      </p>
    </>
  );
}
