"use client";
import * as React from "react";
import { Pencil, Plus, Search } from "lucide-react";

import { useSubcontractorSourcing } from "@/hooks/use-subcontractor-sourcing";
import { useProjects } from "@/hooks/use-projects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubcontractorSourcingEditDialog } from "@/components/procurement/subcontractor-sourcing-edit-dialog";
import type { SubcontractorSourcingRequest } from "@/types/subcontractor-sourcing";

const STATUS_LABEL: Record<string, string> = {
  identifying: "Identifying Subs",
  scoping: "Scoping",
  quoting: "Quoting",
  awarded: "Awarded",
  on_hold: "On Hold",
};

const STATUS_BADGE: Record<string, string> = {
  identifying: "bg-muted text-muted-foreground",
  scoping: "bg-info-soft text-info-foreground",
  quoting: "bg-primary-soft text-primary",
  awarded: "bg-success-soft text-success",
  on_hold: "bg-warning-soft text-warning-foreground",
};

function currency(n?: number) {
  if (n == null) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function SubcontractorSourcingTable() {
  const items = useSubcontractorSourcing();
  const projects = useProjects();
  const [search, setSearch] = React.useState("");
  const [editing, setEditing] = React.useState<SubcontractorSourcingRequest | null>(null);
  const [creating, setCreating] = React.useState(false);

  function projectName(id?: string) {
    if (!id) return "—";
    return projects.find((p) => p.id === id)?.projectName ?? "—";
  }

  const filtered = items.filter((s) => {
    if (!search) return true;
    return `${s.trade} ${s.scopeOfWork} ${s.propertyName ?? ""}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Scoping and budgeting subcontractor work before it's ready to go out for formal
          RFQs — Project and Property are both optional here.
        </p>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="size-3.5" /> Add Entry
        </Button>
      </div>

      <div className="mb-3 flex items-center gap-3">
        <div className="relative flex-1 min-w-[12rem] max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search trade, scope, property…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <span className="text-sm text-muted-foreground">{filtered.length} of {items.length}</span>
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Trade</th>
              <th className="px-4 py-3 font-medium">Scope of Work</th>
              <th className="px-4 py-3 font-medium">Budget</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Notes</th>
              <th className="px-4 py-3 font-medium w-10">Edit</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 text-muted-foreground">{projectName(s.projectId)}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.propertyName ?? "—"}</td>
                <td className="px-4 py-3 font-medium text-foreground">{s.trade}</td>
                <td className="px-4 py-3 text-muted-foreground whitespace-pre-wrap break-words max-w-sm">{s.scopeOfWork}</td>
                <td className="px-4 py-3 text-muted-foreground">{currency(s.budget)}</td>
                <td className="px-4 py-3">
                  <Badge className={`${STATUS_BADGE[s.sourcingStatus] ?? ""} border-transparent`}>
                    {STATUS_LABEL[s.sourcingStatus] ?? s.sourcingStatus}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-pre-wrap break-words max-w-xs">{s.notes ?? "—"}</td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(s)}>
                    <Pencil className="size-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                  {items.length === 0 ? "No entries yet — add the first one above." : "No entries match your search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <SubcontractorSourcingEditDialog entry={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      <SubcontractorSourcingEditDialog entry={null} open={creating} onOpenChange={setCreating} />
    </>
  );
}
