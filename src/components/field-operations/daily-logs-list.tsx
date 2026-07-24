"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Cloud, CloudRain, Sun, Wind, Snowflake } from "lucide-react";

import { useDailyLogs } from "@/hooks/use-daily-logs";
import { useProjects } from "@/hooks/use-projects";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [projectFilter, setProjectFilter] = React.useState("all");

  const projectsWithLogs = projects.filter((p) =>
    logs.some((l) => l.projectId === p.id)
  );

  const filtered = logs.filter((log) => {
    const project = projects.find((p) => p.id === log.projectId);
    const matchesSearch = (project?.projectName ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesProject = projectFilter === "all" || log.projectId === projectFilter;
    return matchesSearch && matchesProject;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projectsWithLogs.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.projectName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="ml-auto text-sm text-muted-foreground">
          {filtered.length} of {logs.length} logs
        </span>
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Weather</th>
              <th className="px-4 py-3 font-medium">Crew</th>
              <th className="px-4 py-3 font-medium">Total Hours</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => {
              const project = projects.find((p) => p.id === log.projectId);
              const totalHours = log.timeEntries.reduce((s, e) => s + e.regularHours + e.overtimeHours, 0);
              const crewCount = new Set(log.timeEntries.map((e) => e.employeeId)).size;
              const WeatherIcon = WEATHER_ICON[log.weatherCondition] ?? Sun;

              return (
                <tr key={log.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                  <td className="px-4 py-3">
                    <Link
                      href={`/field-operations/${log.id}`}
                      className="font-medium text-foreground hover:text-primary hover:underline"
                    >
                      {formatDate(log.date)}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {log.dayOfWeek} ·{" "}
                      <Link href={`/field-operations/day/${log.date}`} className="text-primary hover:underline">
                        view all projects
                      </Link>
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{project?.projectName ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <WeatherIcon className="size-3.5" />
                      {log.weatherCondition.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{crewCount}</td>
                  <td className="px-4 py-3 text-muted-foreground">{totalHours}h</td>
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
