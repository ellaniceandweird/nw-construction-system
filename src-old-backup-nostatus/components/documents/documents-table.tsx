"use client";
import * as React from "react";
import { Pencil, Plus, ExternalLink } from "lucide-react";
import { useDocuments } from "@/hooks/use-documents";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DocumentEditDialog } from "@/components/documents/document-edit-dialog";
import type { ProjectDocument } from "@/types/documents";

const STATUS_CLASS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  internal_review: "bg-warning-soft text-warning-foreground",
  owner_review: "bg-info-soft text-info-foreground",
  approved: "bg-success-soft text-success",
  approved_with_comments: "bg-success-soft text-success",
  rejected: "bg-destructive-soft text-destructive",
  superseded: "bg-muted text-muted-foreground",
  archived: "bg-muted text-muted-foreground",
  expired: "bg-destructive-soft text-destructive",
};

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function projectName(id: string) {
  return MOCK_PROJECTS.find((p) => p.id === id)?.projectName ?? id;
}
function categoryLabel(category: string) {
  return category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function DocumentsTable() {
  const documents = useDocuments();
  const [editing, setEditing] = React.useState<ProjectDocument | null>(null);
  const [creating, setCreating] = React.useState(false);
  const sorted = [...documents].sort((a, b) => new Date(b.lastModifiedDate).getTime() - new Date(a.lastModifiedDate).getTime());

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          A document index, not file storage — each entry links to wherever the file
          actually lives (Google Drive, Dropbox, a shared drive).
        </p>
        <Button size="sm" onClick={() => setCreating(true)} className="shrink-0"><Plus className="size-3.5" /> New Document</Button>
      </div>
      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Doc #</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Rev</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Link</th>
              <th className="px-4 py-3 font-medium">Edit</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((d) => (
              <tr key={d.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{d.documentNumber}</td>
                <td className="px-4 py-3 text-foreground max-w-xs">{d.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{projectName(d.projectId)}</td>
                <td className="px-4 py-3 text-muted-foreground">{categoryLabel(d.category)}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.revision}</td>
                <td className="px-4 py-3">
                  <Badge className={`${STATUS_CLASS[d.documentStatus] ?? ""} border-transparent`}>{categoryLabel(d.documentStatus)}</Badge>
                </td>
                <td className="px-4 py-3">
                  <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                    <ExternalLink className="size-3.5" /> Open
                  </a>
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(d)}><Pencil className="size-3.5" /></Button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (<tr><td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">No documents yet — add one above.</td></tr>)}
          </tbody>
        </table>
      </Card>
      <DocumentEditDialog document={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      <DocumentEditDialog document={null} open={creating} onOpenChange={setCreating} />
    </>
  );
}
