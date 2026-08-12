import { PageHeader } from "@/components/layout/page-header";
import { ApprovalsTable } from "@/components/approvals/approvals-table";

export default function ApprovalsPage() {
  return (
    <>
      <PageHeader
        title="Approvals"
        description="Budgets, quotes, and change orders waiting on sign-off from Sjaak, Carlo, or Ben."
      />
      <ApprovalsTable />
    </>
  );
}
