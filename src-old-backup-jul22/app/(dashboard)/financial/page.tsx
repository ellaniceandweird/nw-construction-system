import { Suspense } from "react";
import { FinancialPageClient } from "@/components/financial/financial-page-client";

export default function FinancialPage() {
  return (
    <Suspense fallback={null}>
      <FinancialPageClient />
    </Suspense>
  );
}
