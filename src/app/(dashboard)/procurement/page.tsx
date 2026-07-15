import { Suspense } from "react";

import { ProcurementPageClient } from "@/components/procurement/procurement-page-client";

export default function ProcurementPage() {
  return (
    <Suspense fallback={null}>
      <ProcurementPageClient />
    </Suspense>
  );
}
