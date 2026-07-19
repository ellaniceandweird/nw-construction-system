import { PageHeader } from "@/components/layout/page-header";
import { ActivityLogTable } from "@/components/dashboard/activity-log-table";

export default function ActivityLogPage() {
  return (
    <>
      <PageHeader
        title="Activity Log"
        description="Every daily log added and maintenance task completed, most recent first."
      />
      <ActivityLogTable />
    </>
  );
}
