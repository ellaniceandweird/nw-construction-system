import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

const PLANNED_RULES = [
  "Notify when a maintenance task has been open more than 14 days",
  "Notify when a vendor invoice is due within 3 days",
  "Auto-flag a project as \"behind schedule\" when 3+ activities are late",
  "Require approval before a Change Order over a set dollar amount is applied",
];

export function AutomationRulesCard() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
        <Clock className="size-8 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium text-foreground">Not built yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Automation rules need real notification delivery (email/in-app alerts)
            behind them, which doesn&apos;t exist yet. Here&apos;s what&apos;s planned once that&apos;s in place:
          </p>
        </div>
        <ul className="mx-auto flex max-w-md flex-col gap-1.5 text-left text-xs text-muted-foreground">
          {PLANNED_RULES.map((rule) => (
            <li key={rule} className="flex items-start gap-2">
              <span className="mt-1 size-1 shrink-0 rounded-full bg-muted-foreground" />
              {rule}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
