import { Suspense } from "react";
import { PropertiesPageClient } from "@/components/properties/properties-page-client";

export default function PropertiesPage() {
  return (
    <Suspense fallback={null}>
      <PropertiesPageClient />
    </Suspense>
  );
}
