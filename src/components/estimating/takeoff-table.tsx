"use client";
import * as React from "react";
import { Pencil, Plus, Search } from "lucide-react";

import { useTakeoffItems } from "@/hooks/use-takeoff-items";
import { useProjects } from "@/hooks/use-projects";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TakeoffEditDialog } from "@/components/estimating/takeoff-edit-dialog";
import type { TakeoffItem } from "@/types/estimating";

export function TakeoffTable() {
  const items = useTakeoffItems();
  const projects = useProjects();
  const [search, setSearch] = React.useState("");
  const [projectFilter, setProjectFilter] = React.useState("all");
  const [editing, setEditing] = React.useState<TakeoffItem | null>(null);
  const [creating, setCreating] = React.useState(false);

  function projectName(id: string) {
    return projects.find((p) => p.id === id)?.projectName ?? "—";
  }

  const filtered = items.filter((t) => {
    const matchesProject = projectFilter === "all" || t.projectId === projectFilter;
    if (!matchesProject) return false;
    if (!search) return true;
    return `${t.description} ${t.location ?? ""} ${t.costCode ?? ""}`.toLowerCase().includes(search.toLowerCase());
  });

  const projectOptions = Array.from(new Set(items.map((t) => t.projectId)));

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Quantities measured off drawings, feeding both estimate pricing and Procurement's
          material forecast.
        </p>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="size-3.5" /> Add Takeoff Item
        </Button>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[12rem]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search description, location, cost code…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Projects" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projectOptions.map((pid) => (<SelectItem key={pid} value={pid}>{projectName(pid)}</SelectItem>))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} of {items.length}</span>
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Cost Code</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Waste %</th>
              <th className="px-4 py-3 font-medium">Adjusted Qty</th>
              <th className="px-4 py-3 font-medium">Measured By</th>
              <th className="px-4 py-3 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{projectName(t.projectId)}</td>
                <td className="px-4 py-3 text-muted-foreground max-w-[220px] truncate" title={t.description}>{t.description}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.location ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.costCode ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{t.quantity} {t.unit}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.wasteFactorPercent != null ? `${t.wasteFactorPercent}%` : "—"}</td>
                <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{t.adjustedQuantity} {t.unit}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.measuredBy ?? "—"}</td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(t)}>
                    <Pencil className="size-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                  {items.length === 0 ? "No takeoff items yet — add the first one above." : "No items match your filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <TakeoffEditDialog item={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      <TakeoffEditDialog item={null} open={creating} onOpenChange={setCreating} />
    </>
  );
}
