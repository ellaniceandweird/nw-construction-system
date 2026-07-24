"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ClipboardList, Wrench } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMaintenanceTasks } from "@/hooks/use-maintenance-tasks";
import { useEquipmentMaintenance } from "@/hooks/use-equipment-maintenance";
import { computeNextDueDate } from "@/lib/maintenance/next-due-date";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  date: string; // yyyy-mm-dd
  type: "task" | "equipment";
  title: string;
  propertyName?: string;
  overdue: boolean;
}

const TODAY = new Date("2026-07-10");

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function MaintenanceCalendarView() {
  const tasks = useMaintenanceTasks();
  const equipment = useEquipmentMaintenance();
  const [monthOffset, setMonthOffset] = React.useState(0);

  const viewMonth = new Date(TODAY.getFullYear(), TODAY.getMonth() + monthOffset, 1);

  const events = React.useMemo(() => {
    const list: CalendarEvent[] = [];

    for (const t of tasks) {
      if (t.taskStatus === "complete" || !t.plannedCompletionDate) continue;
      list.push({
        date: t.plannedCompletionDate.slice(0, 10),
        type: "task",
        title: t.taskDescription,
        propertyName: t.propertyName,
        overdue: new Date(t.plannedCompletionDate) < TODAY,
      });
    }

    for (const e of equipment) {
      const nextDue = computeNextDueDate(e.lastCompleted, e.frequency);
      if (!nextDue) continue;
      list.push({
        date: toISODate(nextDue),
        type: "equipment",
        title: `${e.systemType} — ${e.location}`,
        propertyName: e.propertyName,
        overdue: nextDue < TODAY,
      });
    }

    return list;
  }, [tasks, equipment]);

  const eventsByDate = React.useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      if (!map.has(ev.date)) map.set(ev.date, []);
      map.get(ev.date)!.push(ev);
    }
    return map;
  }, [events]);

  const firstOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const startWeekday = firstOfMonth.getDay();

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Auto-generated — pulls target completion dates from General Maintenance and computed
        next-due dates from Recurring Maintenance. Nothing is entered here directly; edit the
        source task or schedule to move something.
      </p>

      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => setMonthOffset((m) => m - 1)}>
          <ChevronLeft className="size-4" />
        </Button>
        <h3 className="text-lg font-semibold text-foreground">
          {viewMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <Button variant="outline" size="icon" onClick={() => setMonthOffset((m) => m + 1)}>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <Card>
        <CardContent>
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border text-center text-xs font-medium text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="bg-card py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-b-lg border-x border-b border-border bg-border">
            {cells.map((day, i) => {
              if (day === null) return <div key={i} className="min-h-[6rem] bg-muted/30" />;
              const dateStr = toISODate(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day));
              const dayEvents = eventsByDate.get(dateStr) ?? [];
              const isToday = dateStr === toISODate(TODAY);
              return (
                <div key={i} className={cn("min-h-[6rem] bg-card p-1.5", isToday && "bg-primary/5")}>
                  <div className={cn("mb-1 text-xs font-medium", isToday ? "text-primary" : "text-muted-foreground")}>
                    {day}
                  </div>
                  <div className="flex flex-col gap-1">
                    {dayEvents.slice(0, 3).map((ev, idx) => (
                      <div
                        key={idx}
                        title={`${ev.title}${ev.propertyName ? ` — ${ev.propertyName}` : ""}`}
                        className={cn(
                          "flex items-center gap-1 truncate rounded px-1 py-0.5 text-[10px] leading-tight",
                          ev.overdue
                            ? "bg-destructive-soft text-destructive"
                            : ev.type === "task"
                            ? "bg-primary/10 text-primary"
                            : "bg-warning-soft text-warning-foreground"
                        )}
                      >
                        {ev.type === "task" ? (
                          <ClipboardList className="size-2.5 shrink-0" />
                        ) : (
                          <Wrench className="size-2.5 shrink-0" />
                        )}
                        <span className="truncate">{ev.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><Badge className="bg-primary/10 text-primary border-transparent">■</Badge> General Maintenance</span>
        <span className="flex items-center gap-1.5"><Badge className="bg-warning-soft text-warning-foreground border-transparent">■</Badge> Recurring Maintenance</span>
        <span className="flex items-center gap-1.5"><Badge className="bg-destructive-soft text-destructive border-transparent">■</Badge> Overdue</span>
      </div>
    </div>
  );
}
