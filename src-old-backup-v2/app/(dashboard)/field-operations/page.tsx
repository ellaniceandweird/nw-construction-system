import Link from "next/link";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { DailyLogsList } from "@/components/field-operations/daily-logs-list";

export default function FieldOperationsPage() {
  return (
    <>
      <PageHeader
        title="Daily Logs"
        description="Real field activity from crew attendance, hours worked, and daily progress across every project."
        actions={
          <Button asChild>
            <Link href="/field-operations/new">
              <Plus /> New Daily Log
            </Link>
          </Button>
        }
      />
      <DailyLogsList />
    </>
  );
}
