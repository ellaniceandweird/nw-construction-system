"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Cloud, CloudRain, Sun, Wind, Snowflake, Trash2, Users, Clock } from "lucide-react";

import { useDailyLogs } from "@/hooks/use-daily-logs";
import { useProjects } from "@/hooks/use-projects";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { deleteDailyLog } from "@/lib/field-operations/daily-log-store";
import { Card } from "@/components/ui/card";
import type { WeatherCondition } from "@/types/field-operations";

const WEATHER_ICON: Partial<Record<WeatherCondition, typeof Sun>> = {
  clear: Sun,
  cloudy: Cloud,
  partly_cloudy: Cloud,
  light_rain: CloudRain,
  heavy_rain: CloudRain,
  high_winds: Wind,
  snow: Snowflake,
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function DailyLogsList() {
  const projects = useProjects();
  const logs = useDailyLogs();
  const [search, setSearch] = React.useState("");
  const [confirmingDeleteId, setConfirmingDeleteId] = React.useState<string | null>(null);

  function projectNamesFor(log: (typeof logs)[number]) {
    return Array.from(
      new Set(
        log.timeEntries
          .map((e) => projects.find((p) => p.id === e.projectId)?.projectName)
          .filter((n): n is string => !!n)
      )
    );
  }

  const filtered = logs
    .filter((log) => {
      if (!search) return true;
      const haystack = projectNamesFor(log).join(" ").toLowerCase();
      return haystack.includes(search.toLowerCase());
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by project..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="ml-auto text-sm text-muted-foreground">
          {filtered.length} of {logs.length} logs
        </span>
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Weather</th>
              <th className="px-4 py-3 font-medium">Crew</th>
              <th className="px-4 py-3 font-medium">Total Hours</th>
              <th className="px-4 py-3 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => {
              const totalHours = log.timeEntries.reduce((s, e) => s + e.regularHours + e.overtimeHours, 0);
              const crewCount = new Set(log.timeEntries.map((e) => e.employeeId)).size;
              const WeatherIcon = WEATHER_ICON[log.weatherCondition] ?? Sun;
              const projectNames = projectNamesFor(log);

              return (
                <tr key={log.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                  <td className="px-4 py-3">
                    <Link
                      href={`/field-operations/${log.id}`}
                      className="font-medium text-foreground hover:text-primary hover:underline"
                    >
                      {formatDate(log.date)}
                    </Link>
                    <p className="text-xs text-muted-foreground">{log.dayOfWeek}</p>
                    {projectNames.length > 0 && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground" title={projectNames.join(", ")}>
                        {projectNames.join(", ")}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-info-soft px-2.5 py-1 text-xs font-medium text-info-foreground">
                      <WeatherIcon className="size-3.5" />
                      {log.weatherCondition.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users className="size-3.5" />
                      {crewCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      {totalHours}h
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {confirmingDeleteId === log.id ? (
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <Button variant="destructive" size="sm" onClick={() => { deleteDailyLog(log.id); setConfirmingDeleteId(null); }}>
                          Confirm
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setConfirmingDeleteId(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setConfirmingDeleteId(log.id)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No daily logs match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
