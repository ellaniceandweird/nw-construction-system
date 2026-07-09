import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

const PLACEHOLDER_WIDGETS = [
  { title: "Active Projects", hint: "Executive Summary" },
  { title: "Delayed Projects", hint: "Executive Summary" },
  { title: "Project Health", hint: "Portfolio Health" },
  { title: "Schedule Summary", hint: "This Week" },
  { title: "Procurement Summary", hint: "RFQs & POs" },
  { title: "Financial Summary", hint: "Budget vs Actual" },
  { title: "Field Operations", hint: "Crews & Daily Logs" },
  { title: "AI Risk Alerts", hint: "Predictive Risk" },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Role-aware operational overview — updates automatically as project data changes."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PLACEHOLDER_WIDGETS.map((w) => (
          <Card key={w.title}>
            <CardHeader>
              <CardTitle>{w.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-foreground">—</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {w.hint} · widget built in Phase 5
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
