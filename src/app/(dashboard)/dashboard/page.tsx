import { Suspense } from "react";
import { DashboardPageClient } from "@/components/dashboard/dashboard-page-client";

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardPageClient />
    </Suspense>
  );
}
