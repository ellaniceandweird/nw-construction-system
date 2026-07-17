import { Suspense } from "react";
import { FieldOperationsPageClient } from "@/components/field-operations/field-operations-page-client";

export default function FieldOperationsPage() {
  return (
    <Suspense fallback={null}>
      <FieldOperationsPageClient />
    </Suspense>
  );
}
