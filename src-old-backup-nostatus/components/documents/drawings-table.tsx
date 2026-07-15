"use client";
import * as React from "react";
import { Pencil, Plus, ExternalLink, ChevronRight } from "lucide-react";
import { useDrawings } from "@/hooks/use-drawings";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DrawingEditDialog } from "@/components/documents/drawing-edit-dialog";
import type { Drawing } from "@/types/documents";

const STATUS_CLASS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  internal_review: "bg-warning-soft text-warning-foreground",
  owner_review: "bg-info-soft text-info-foreground",
  approved: "bg-success-soft text-success",
  approved_with_comments: "bg-success-soft text-success",
  rejected: "bg-destructive-soft text-destructive",
  superseded: "bg-muted text-muted-foreground",
  archived: "bg-muted text-muted-foreground",
};

function projectName(id: string) {
  return MOCK_PROJECTS.find((p) => p.id === id)?.projectName ?? id;
}

export function DrawingsTable() {
  const drawings = useDrawings();
  const [editing, setEditing] = React.useState<Drawing | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const sorted = [...drawings].sort((a, b) => a.drawingNumber.localeCompare(b.drawingNumber));

  return (
    <>
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
              <th className="px-4 py-3 font-medium">Discipline</th>
              <th className="px-4 py-3 font-medium">Rev</th>
              <th className="px-4 py-3 font-medium">Status</th>
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
                    <td className="px-4 py-3 text-muted-foreground">{projectName(d.projectId)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.discipline.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.revision}</td>
                    <td className="px-4 py-3">
                      <Badge className={`${STATUS_CLASS[d.drawingStatus] ?? ""} border-transparent`}>{d.drawingStatus.replace(/_/g, " ")}</Badge>
                    </td>
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
                      <td colSpan={8} className="bg-muted/20 px-4 py-2">
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
            {sorted.length === 0 && (<tr><td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">No drawings yet — add one above.</td></tr>)}
          </tbody>
        </table>
      </Card>
      <DrawingEditDialog drawing={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      <DrawingEditDialog drawing={null} open={creating} onOpenChange={setCreating} />
    </>
  );
}
