"use client";
import * as React from "react";
import { Pencil, Plus, Search } from "lucide-react";

import { useAlarmVerbalPasscodes } from "@/hooks/use-alarm-verbal-passcodes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlarmVerbalPasscodeEditDialog } from "@/components/maintenance/alarm-verbal-passcode-edit-dialog";
import type { AlarmVerbalPasscode } from "@/types/alarm-verbal-passcode";

export function AlarmVerbalPasscodeTable() {
  const items = useAlarmVerbalPasscodes();
  const [search, setSearch] = React.useState("");
  const [editing, setEditing] = React.useState<AlarmVerbalPasscode | null>(null);
  const [creating, setCreating] = React.useState(false);

  const filtered = items.filter((a) => {
    if (!search) return true;
    return `${a.propertyName} ${a.verbalPasscode}`.toLowerCase().includes(search.toLowerCase());
  });

  const sorted = [...filtered].sort((a, b) => a.propertyName.localeCompare(b.propertyName));

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Verbal passcode given to the alarm monitoring company to verify your identity
          over the phone — separate from physical door/access Key Codes.
        </p>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="size-3.5" /> Add Passcode
        </Button>
      </div>

      <div className="mb-3 flex items-center gap-3">
        <div className="relative flex-1 min-w-[12rem] max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search property or passcode…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <span className="text-sm text-muted-foreground">{sorted.length} of {items.length}</span>
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Verbal Passcode</th>
              <th className="px-4 py-3 font-medium">Notes</th>
              <th className="px-4 py-3 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((a) => (
              <tr key={a.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{a.propertyName}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.verbalPasscode}</td>
                <td className="px-4 py-3 text-muted-foreground whitespace-pre-wrap break-words">{a.notes || "—"}</td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(a)}>
                    <Pencil className="size-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  {items.length === 0 ? "No alarm passcodes yet — add the first one above." : "No entries match your search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <AlarmVerbalPasscodeEditDialog entry={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      <AlarmVerbalPasscodeEditDialog entry={null} open={creating} onOpenChange={setCreating} />
    </>
  );
}
