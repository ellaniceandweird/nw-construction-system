import { Suspense } from "react";

import { EstimatingPageClient } from "@/components/estimating/estimating-page-client";

export default function EstimatingPage() {
  return (
    <Suspense fallback={null}>
      <EstimatingPageClient />
    </Suspense>
  );
}
