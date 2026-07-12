"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { MOCK_EQUIPMENT_MAINTENANCE } from "@/lib/data/mock/maintenance-equipment";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Parses the real frequency text (e.g. "3-months", "1-months",
 * "2-months (monitor in spring)") into a number of months. Returns null
 * for text that doesn't contain a parseable interval (e.g. "twice a year"
 * written in a form we can't confidently convert) rather than guessing.
 */
function parseFrequencyMonths(frequency?: string): number | null {
  if (!frequency) return null;
  const match = frequency.match(/(\d+)\s*-?\s*month/i);
  if (match) return parseInt(match[1], 10);
  if (/twice a year|semi-?annual/i.test(frequency)) return 6;
  if (/annual|yearly|once a year/i.test(frequency)) return 12;
  return null;
}

function computeNextDue(lastCompleted?: string, frequency?: string): string {
  const months = parseFrequencyMonths(frequency);
  if (!lastCompleted || months === null) return "—";
  const date = new Date(lastCompleted);
  date.setMonth(date.getMonth() + months);
  return formatDate(date.toISOString());
}

function isOverdue(lastCompleted?: string, frequency?: string): boolean {
  const months = parseFrequencyMonths(frequency);
  if (!lastCompleted || months === null) return false;
  const date = new Date(lastCompleted);
  date.setMonth(date.getMonth() + months);
  return date < new Date("2026-07-10");
}

export function EquipmentMaintenanceTable() {
  const [search, setSearch] = React.useState("");

  const filtered = MOCK_EQUIPMENT_MAINTENANCE.filter(
    (e) =>
      e.propertyName.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase()) ||
      e.systemType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search property, location, system..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="ml-auto text-sm text-muted-foreground">
          {filtered.length} of {MOCK_EQUIPMENT_MAINTENANCE.length} equipment records
        </span>
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">System</th>
              <th className="px-4 py-3 font-medium">Maintenance Needed</th>
              <th className="px-4 py-3 font-medium">Frequency</th>
              <th className="px-4 py-3 font-medium">Last Completed</th>
              <th className="px-4 py-3 font-medium">Next Due</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{e.propertyName}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.location}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.systemType}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.maintenanceNeeded ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.frequency ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(e.lastCompleted)}</td>
                <td
                  className={
                    isOverdue(e.lastCompleted, e.frequency)
                      ? "px-4 py-3 font-medium text-destructive"
                      : "px-4 py-3 text-muted-foreground"
                  }
                >
                  {computeNextDue(e.lastCompleted, e.frequency)}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  No equipment records match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
