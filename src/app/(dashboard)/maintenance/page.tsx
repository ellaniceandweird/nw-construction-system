import { Suspense } from "react";

import { MaintenancePageClient } from "@/components/maintenance/maintenance-page-client";

export default function MaintenancePage() {
  return (
    <Suspense fallback={null}>
      <MaintenancePageClient />
    </Suspense>
  );
}
