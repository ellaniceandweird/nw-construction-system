import { Suspense } from "react";
import { ReferencesPageClient } from "@/components/references/references-page-client";

export default function ReferencesPage() {
  return (
    <Suspense fallback={null}>
      <ReferencesPageClient />
    </Suspense>
  );
}
