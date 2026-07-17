"use client";
import * as React from "react";
import { Pencil, Plus, ExternalLink, Search, Trash2 } from "lucide-react";
import { useDocuments } from "@/hooks/use-documents";
import { useRowSelection } from "@/hooks/use-row-selection";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocumentEditDialog } from "@/components/documents/document-edit-dialog";
import { deleteDocument } from "@/lib/documents/document-store";
import type { ProjectDocument } from "@/types/documents";

const ALL = "all";

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
  const [search, setSearch] = React.useState("");
  const [projectFilter, setProjectFilter] = React.useState(ALL);
  const [tagFilter, setTagFilter] = React.useState(ALL);

  const projectsWithDocs = React.useMemo(
    () => MOCK_PROJECTS.filter((p) => documents.some((d) => d.projectId === p.id)),
    [documents]
  );
  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    for (const d of documents) for (const t of d.tags ?? []) tags.add(t);
    return [...tags].sort();
  }, [documents]);

  const filtered = documents.filter((d) => {
    if (projectFilter !== ALL && d.projectId !== projectFilter) return false;
    if (tagFilter !== ALL && !(d.tags ?? []).includes(tagFilter)) return false;
    if (search) {
      const haystack = `${d.title} ${categoryLabel(d.category)} ${(d.tags ?? []).join(" ")}`.toLowerCase();
      if (!haystack.includes(search.toLowerCase())) return false;
    }
    return true;
  });
  const sorted = [...filtered].sort((a, b) => new Date(b.lastModifiedDate).getTime() - new Date(a.lastModifiedDate).getTime());

  const hasActiveFilters = search || projectFilter !== ALL || tagFilter !== ALL;
  const { selected, toggle, toggleAll, clear, allSelected, count } = useRowSelection(sorted.map((d) => d.id));
  const [confirmingBulkDelete, setConfirmingBulkDelete] = React.useState(false);

  function handleBulkDelete() {
    for (const id of selected) deleteDocument(id);
    clear();
    setConfirmingBulkDelete(false);
  }

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          A document index, not file storage — each entry links to wherever the file
          actually lives (Google Drive, Dropbox, a shared drive).
        </p>
        <Button size="sm" onClick={() => setCreating(true)} className="shrink-0"><Plus className="size-3.5" /> New Document</Button>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[12rem]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search title, category, or tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-56"><SelectValue placeholder="All Properties" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Properties</SelectItem>
            {projectsWithDocs.map((p) => (<SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All Tags" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Tags</SelectItem>
            {allTags.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setProjectFilter(ALL); setTagFilter(ALL); }}>
            Clear
          </Button>
        )}
      </div>

      {count > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
          <span className="text-sm font-medium text-foreground">{count} selected</span>
          {confirmingBulkDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete {count} document{count === 1 ? "" : "s"}?</span>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>Confirm Delete</Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmingBulkDelete(false)}>Cancel</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setConfirmingBulkDelete(true)}><Trash2 className="size-3.5" /> Delete Selected</Button>
              <Button variant="ghost" size="sm" onClick={clear}>Clear Selection</Button>
            </div>
          )}
        </div>
      )}

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="w-8 px-4 py-3"><Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" /></th>
              <th className="px-4 py-3 font-medium">Doc #</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Tags</th>
              <th className="px-4 py-3 font-medium">Rev</th>
              <th className="px-4 py-3 font-medium">Link</th>
              <th className="px-4 py-3 font-medium">Edit</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((d) => (
              <tr key={d.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3"><Checkbox checked={selected.has(d.id)} onCheckedChange={() => toggle(d.id)} aria-label={`Select ${d.title}`} /></td>
                <td className="px-4 py-3 font-medium text-foreground">{d.documentNumber}</td>
                <td className="px-4 py-3 text-foreground max-w-xs">{d.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{projectName(d.projectId)}</td>
                <td className="px-4 py-3 text-muted-foreground">{categoryLabel(d.category)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(d.tags ?? []).map((t) => (
                      <Badge key={t} className="bg-muted text-muted-foreground border-transparent text-[10px]">{t}</Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{d.revision}</td>
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
            {sorted.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-muted-foreground">
                  {hasActiveFilters ? "No documents match your filters." : "No documents yet — add one above."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
      <DocumentEditDialog document={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      <DocumentEditDialog document={null} open={creating} onOpenChange={setCreating} />
    </>
  );
}
