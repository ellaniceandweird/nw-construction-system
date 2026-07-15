import { PageHeader } from "@/components/layout/page-header";
import { DailyLogForm } from "@/components/field-operations/daily-log-form";

export default function NewDailyLogPage() {
  return (
    <>
      <PageHeader
        title="New Daily Log"
        description="Log today's crew attendance, hours, and activities. Saved locally until Excel sync arrives in Phase 8."
      />
      <DailyLogForm />
    </>
  );
}
