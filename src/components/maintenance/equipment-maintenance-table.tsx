"use client";

import * as React from "react";
import { Search, Pencil, Plus } from "lucide-react";

import { useEquipmentMaintenance } from "@/hooks/use-equipment-maintenance";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrintButton } from "@/components/shared/print-button";
import { EquipmentMaintenanceEditDialog } from "@/components/maintenance/equipment-maintenance-edit-dialog";
import type { EquipmentMaintenanceSchedule } from "@/types/maintenance";

type SortOption = "default" | "next_due";

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Parses the real frequency text (e.g. "3-months", "1-months",
 * "2-months (monitor in spring)") into a number of months. Returns null
 * for text that doesn't contain a parseable interval rather than guessing.
 */
function parseFrequencyMonths(frequency?: string): number | null {
  if (!frequency) return null;
  const match = frequency.match(/(\d+)\s*-?\s*month/i);
  if (match) return parseInt(match[1], 10);
  if (/twice a year|semi-?annual/i.test(frequency)) return 6;
  if (/annual|yearly|once a year/i.test(frequency)) return 12;
  return null;
}

function computeNextDueDate(lastCompleted?: string, frequency?: string): Date | null {
  const months = parseFrequencyMonths(frequency);
  if (!lastCompleted || months === null) return null;
  const date = new Date(lastCompleted);
  date.setMonth(date.getMonth() + months);
  return date;
}

function isOverdue(lastCompleted?: string, frequency?: string): boolean {
  const date = computeNextDueDate(lastCompleted, frequency);
  return date !== null && date < new Date("2026-07-10");
}

export function EquipmentMaintenanceTable() {
  const records = useEquipmentMaintenance();
  const [search, setSearch] = React.useState("");
  const [propertyFilter, setPropertyFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<SortOption>("default");
  const [editingRecord, setEditingRecord] = React.useState<EquipmentMaintenanceSchedule | null>(null);
  const [creating, setCreating] = React.useState(false);

  const propertyNames = Array.from(new Set(records.map((e) => e.propertyName)));

  let filtered = records.filter((e) => {
    const matchesSearch =
      e.propertyName.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase()) ||
      e.systemType.toLowerCase().includes(search.toLowerCase());
    const matchesProperty = propertyFilter === "all" || e.propertyName === propertyFilter;
    return matchesSearch && matchesProperty;
  });

  if (sortBy === "next_due") {
    filtered = [...filtered].sort((a, b) => {
      const dateA = computeNextDueDate(a.lastCompleted, a.frequency);
      const dateB = computeNextDueDate(b.lastCompleted, b.frequency);
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA.getTime() - dateB.getTime();
    });
  }

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
        <Select value={propertyFilter} onValueChange={setPropertyFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Properties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {propertyNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default Order</SelectItem>
            <SelectItem value="next_due">Next Due (Earliest → Latest)</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" onClick={() => setCreating(true)} className="print:hidden">
          <Plus className="size-3.5" /> Add Row
        </Button>
        <PrintButton />
        <span className="ml-auto text-sm text-muted-foreground print:hidden">
          {filtered.length} of {records.length} equipment records
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
              <th className="px-4 py-3 font-medium">Notes</th>
              <th className="px-4 py-3 font-medium print:hidden">Edit</th>
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
                  {formatDate(computeNextDueDate(e.lastCompleted, e.frequency)?.toISOString())}
                </td>
                <td className="px-4 py-3 text-muted-foreground max-w-xs">{e.notes ?? "—"}</td>
                <td className="px-4 py-3 print:hidden">
                  <Button variant="ghost" size="icon" onClick={() => setEditingRecord(e)}>
                    <Pencil className="size-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                  No equipment records match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <EquipmentMaintenanceEditDialog
        record={editingRecord}
        open={!!editingRecord}
        onOpenChange={(open) => !open && setEditingRecord(null)}
      />
      <EquipmentMaintenanceEditDialog
        record={null}
        open={creating}
        onOpenChange={setCreating}
      />
    </div>
  );
}
