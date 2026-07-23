"use client";

import * as React from "react";
import { Pencil, Plus, Search, ArrowUpDown, KeyRound } from "lucide-react";

import { useKeyCodes } from "@/hooks/use-key-codes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KeyCodeEditDialog } from "@/components/maintenance/key-code-edit-dialog";
import type { KeyCodeEntry } from "@/types/maintenance";

export function KeyCodesTable() {
  const entries = useKeyCodes();
  const [editing, setEditing] = React.useState<KeyCodeEntry | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [propertyFilter, setPropertyFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<"property" | "door">("property");

  const propertyNames = Array.from(new Set(entries.map((e) => e.propertyName))).sort();

  const filtered = entries.filter((e) => {
    const matchesProperty = propertyFilter === "all" || e.propertyName === propertyFilter;
    if (!matchesProperty) return false;
    if (!search) return true;
    const haystack = `${e.propertyName} ${e.spaceName ?? ""} ${e.doorIdentifier} ${e.accessCode ?? ""}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const sorted = [...filtered].sort((a, b) =>
    sortBy === "door" ? a.doorIdentifier.localeCompare(b.doorIdentifier) : a.propertyName.localeCompare(b.propertyName)
  );

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Door, lock, and alarm codes per property/space — handy when a copy goes missing or someone new needs access.
        </p>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="size-3.5" /> Add Entry
        </Button>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[12rem]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search space, door, code…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={propertyFilter} onValueChange={setPropertyFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Properties" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {propertyNames.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[160px]"><ArrowUpDown className="size-3.5 text-muted-foreground" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="property">Property (A-Z)</SelectItem>
            <SelectItem value="door">Door (A-Z)</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{sorted.length} of {entries.length}</span>
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Space / Tenant</th>
              <th className="px-4 py-3 font-medium">Door Identifier</th>
              <th className="px-4 py-3 font-medium">Access Code</th>
              <th className="px-4 py-3 font-medium">Notes</th>
              <th className="px-4 py-3 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((e) => (
              <tr key={e.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{e.propertyName}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.spaceName ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.doorIdentifier}</td>
                <td className="px-4 py-3 font-mono text-muted-foreground">{e.accessCode ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate" title={e.notes}>{e.notes ?? "—"}</td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(e)}>
                    <Pencil className="size-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  <KeyRound className="mx-auto mb-2 size-6 opacity-40" />
                  {entries.length === 0 ? "No key codes logged yet — add the first one above." : "No entries match your filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <KeyCodeEditDialog entry={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      <KeyCodeEditDialog entry={null} open={creating} onOpenChange={setCreating} />
    </>
  );
}
