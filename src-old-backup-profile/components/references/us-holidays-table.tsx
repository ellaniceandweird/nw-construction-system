"use client";
import * as React from "react";
import { Pencil, Plus, Upload } from "lucide-react";
import { useUSHolidays } from "@/hooks/use-us-holidays";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { USHolidayEditDialog } from "@/components/references/us-holiday-edit-dialog";
import { ImportHolidaysDialog } from "@/components/references/import-holidays-dialog";
import type { USHoliday } from "@/types/references";

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

export function USHolidaysTable() {
  const holidays = useUSHolidays();
  const [editing, setEditing] = React.useState<USHoliday | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const sorted = [...holidays].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          US holidays for pay period and scheduling awareness.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="outline" onClick={() => setImporting(true)}><Upload className="size-3.5" /> Import</Button>
          <Button size="sm" onClick={() => setCreating(true)}><Plus className="size-3.5" /> New Holiday</Button>
        </div>
      </div>
      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Holiday</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Notes</th>
              <th className="px-4 py-3 font-medium">Edit</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((h) => (
              <tr key={h.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{h.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(h.date)}</td>
                <td className="px-4 py-3 text-muted-foreground">{h.notes ?? "—"}</td>
                <td className="px-4 py-3"><Button variant="ghost" size="icon" onClick={() => setEditing(h)}><Pencil className="size-3.5" /></Button></td>
              </tr>
            ))}
            {sorted.length === 0 && (<tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">No holidays yet — add one above.</td></tr>)}
          </tbody>
        </table>
      </Card>
      <USHolidayEditDialog holiday={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      <USHolidayEditDialog holiday={null} open={creating} onOpenChange={setCreating} />
      <ImportHolidaysDialog open={importing} onOpenChange={setImporting} />
    </>
  );
}
