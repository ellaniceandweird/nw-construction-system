"use client";
import * as React from "react";
import { Pencil, Plus, ExternalLink, ChevronRight, Search, ArrowUpDown } from "lucide-react";
import { useDrawings } from "@/hooks/use-drawings";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
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
import { DrawingEditDialog } from "@/components/documents/drawing-edit-dialog";
import type { Drawing } from "@/types/documents";

function resolvedProjectName(d: Drawing) {
  const match = MOCK_PROJECTS.find((p) => p.id === d.projectId);
  return match?.projectName ?? d.projectName ?? "—";
}

export function DrawingsTable() {
  const drawings = useDrawings();
  const [editing, setEditing] = React.useState<Drawing | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"number" | "date">("number");

  const filtered = drawings.filter((d) => {
    if (!search) return true;
    return `${d.drawingNumber} ${d.drawingTitle}`.toLowerCase().includes(search.toLowerCase());
  });
  const sorted = [...filtered].sort((a, b) =>
    sortBy === "number" ? a.drawingNumber.localeCompare(b.drawingNumber) : b.issueDate.localeCompare(a.issueDate)
  );

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[12rem]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search drawing # or title…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[170px]"><ArrowUpDown className="size-3.5 text-muted-foreground" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="number">Drawing # (A-Z)</SelectItem>
            <SelectItem value="date">Issue Date (Newest)</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{sorted.length} of {drawings.length}</span>
      </div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Drawing register by property — each revision change archives the previous link,
          so you can always find an earlier version.
        </p>
        <Button size="sm" onClick={() => setCreating(true)} className="shrink-0"><Plus className="size-3.5" /> New Drawing</Button>
      </div>
      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Drawing #</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Rev</th>
              <th className="px-4 py-3 font-medium">Link</th>
              <th className="px-4 py-3 font-medium">Edit</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((d) => {
              const hasHistory = (d.previousRevisionUrls?.length ?? 0) > 0;
              const isExpanded = expandedId === d.id;
              return (
                <React.Fragment key={d.id}>
                  <tr className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {hasHistory ? (
                        <button className="flex items-center gap-1 hover:text-primary hover:underline" onClick={() => setExpandedId(isExpanded ? null : d.id)}>
                          <ChevronRight className={`size-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                          {d.drawingNumber}
                        </button>
                      ) : d.drawingNumber}
                    </td>
                    <td className="px-4 py-3 text-foreground max-w-xs">{d.drawingTitle}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.propertyName ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{resolvedProjectName(d)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.revision}</td>
                    <td className="px-4 py-3">
                      <a href={d.currentRevisionUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                        <ExternalLink className="size-3.5" /> Open
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="icon" onClick={() => setEditing(d)}><Pencil className="size-3.5" /></Button>
                    </td>
                  </tr>
                  {isExpanded && hasHistory && (
                    <tr>
                      <td colSpan={7} className="bg-muted/20 px-4 py-2">
                        <p className="mb-1 text-xs font-medium text-muted-foreground">Previous revisions:</p>
                        <ul className="flex flex-col gap-1">
                          {d.previousRevisionUrls!.map((url, i) => (
                            <li key={i}>
                              <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                                <ExternalLink className="size-3" /> {url}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {sorted.length === 0 && (<tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">No drawings yet — add one above.</td></tr>)}
          </tbody>
        </table>
      </Card>
      <DrawingEditDialog drawing={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      <DrawingEditDialog drawing={null} open={creating} onOpenChange={setCreating} />
    </>
  );
}
