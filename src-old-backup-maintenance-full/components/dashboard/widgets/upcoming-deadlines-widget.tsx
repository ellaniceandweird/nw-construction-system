import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getUpcomingDeadlines } from "@/lib/dashboard/metrics";

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function UpcomingDeadlinesWidget() {
  const deadlines = getUpcomingDeadlines(6);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-3 font-medium">Type</th>
                <th className="pb-2 pr-3 font-medium">Item</th>
                <th className="pb-2 pr-3 font-medium">Project / Property</th>
                <th className="pb-2 pr-3 font-medium">Due Date</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {deadlines.map((d) => (
                <tr key={d.id} className="border-b border-border/60 last:border-0">
                  <td className="py-2 pr-3 text-muted-foreground">{d.type}</td>
                  <td className="py-2 pr-3 text-foreground">{d.item}</td>
                  <td className="py-2 pr-3 text-muted-foreground">
                    {d.projectOrProperty}
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">
                    {formatDate(d.dueDate)}
                  </td>
                  <td className="py-2">
                    <StatusBadge
                      status={
                        d.status === "overdue"
                          ? "behind_schedule"
                          : d.status === "due_soon"
                          ? "due_soon"
                          : "upcoming"
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
