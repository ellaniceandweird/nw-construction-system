"use client";

import * as React from "react";
import { Pencil, Plus, Search, ArrowUpDown, PaintBucket } from "lucide-react";

import { usePaintLog } from "@/hooks/use-paint-log";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaintLogEditDialog } from "@/components/maintenance/paint-log-edit-dialog";
import type { PaintLogEntry } from "@/types/maintenance";

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function PaintLogTable() {
  const entries = usePaintLog();
  const [editing, setEditing] = React.useState<PaintLogEntry | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [propertyFilter, setPropertyFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<"property" | "location" | "date_desc">("property");

  const propertyNames = Array.from(new Set(entries.map((e) => e.propertyName))).sort();

  const filtered = entries.filter((e) => {
    const matchesProperty = propertyFilter === "all" || e.propertyName === propertyFilter;
    if (!matchesProperty) return false;
    if (!search) return true;
    const haystack = `${e.propertyName} ${e.location} ${e.brand ?? ""} ${e.colorName ?? ""} ${e.colorCode ?? ""}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "location") return a.location.localeCompare(b.location);
    if (sortBy === "date_desc") return (b.dateApplied ?? "").localeCompare(a.dateApplied ?? "");
    return a.propertyName.localeCompare(b.propertyName);
  });

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Exact paint used per property/room, so a future touch-up matches without guessing.
        </p>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="size-3.5" /> Add Entry
        </Button>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[12rem]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search location, brand, color…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={propertyFilter} onValueChange={setPropertyFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Properties" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {propertyNames.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[170px]"><ArrowUpDown className="size-3.5 text-muted-foreground" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="property">Property (A-Z)</SelectItem>
            <SelectItem value="location">Location (A-Z)</SelectItem>
            <SelectItem value="date_desc">Date Applied (Newest)</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{sorted.length} of {entries.length}</span>
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Brand</th>
              <th className="px-4 py-3 font-medium">Color Name</th>
              <th className="px-4 py-3 font-medium">Color Code</th>
              <th className="px-4 py-3 font-medium">Sheen</th>
              <th className="px-4 py-3 font-medium">Date Applied</th>
              <th className="px-4 py-3 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((e) => (
              <tr key={e.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{e.propertyName}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.location}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.brand ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.colorName ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.colorCode ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.sheen ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(e.dateApplied)}</td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(e)}>
                    <Pencil className="size-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                  <PaintBucket className="mx-auto mb-2 size-6 opacity-40" />
                  {entries.length === 0 ? "No paint log entries yet — add the first one above." : "No entries match your filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <PaintLogEditDialog entry={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      <PaintLogEditDialog entry={null} open={creating} onOpenChange={setCreating} />
    </>
  );
}
