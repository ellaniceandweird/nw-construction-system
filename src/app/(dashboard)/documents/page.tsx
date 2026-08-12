import { Suspense } from "react";
import { DocumentsPageClient } from "@/components/documents/documents-page-client";

export default function DocumentsPage() {
  return (
    <Suspense fallback={null}>
      <DocumentsPageClient />
    </Suspense>
  );
}
