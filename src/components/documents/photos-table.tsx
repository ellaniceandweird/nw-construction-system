"use client";
import * as React from "react";
import { Plus, Trash2, ImageOff, Search } from "lucide-react";
import { useFieldPhotos } from "@/hooks/use-field-photos";
import { deletePhoto, restorePhoto } from "@/lib/documents/photo-store";
import { showUndoToast } from "@/lib/toast/toast-store";
import { useProjects } from "@/hooks/use-projects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddPhotosDialog } from "@/components/documents/add-photos-dialog";
import type { FieldPhoto } from "@/types/field-operations";
import type { Project } from "@/types/project";

function resolvedProjectName(photo: FieldPhoto, projects: Project[]) {
  const match = projects.find((p) => p.id === photo.projectId);
  return match?.projectName ?? photo.projectName ?? "Unspecified Project";
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function PhotoThumbnail({ photo }: { photo: FieldPhoto }) {
  const [failed, setFailed] = React.useState(!photo.thumbnailUrl);
  return (
    <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md bg-muted">
      {failed ? (
        <ImageOff className="size-8 text-muted-foreground" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo.thumbnailUrl} alt={photo.caption ?? ""} className="h-full w-full object-cover" onError={() => setFailed(true)} />
      )}
    </div>
  );
}

export function PhotosTable() {
  const projects = useProjects();
  const allPhotos = useFieldPhotos();
  const [adding, setAdding] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");

  const photos = allPhotos.filter((p) => {
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    if (search && !(p.caption ?? "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const allCategories = [...new Set(allPhotos.map((p) => p.category))];

  const byProject = new Map<string, FieldPhoto[]>();
  for (const p of photos) {
    const key = p.projectId === "__manual__" ? `manual:${p.projectName ?? "Unspecified"}` : p.projectId;
    if (!byProject.has(key)) byProject.set(key, []);
    byProject.get(key)!.push(p);
  }
  const projectKeys = [...byProject.keys()].sort((a, b) =>
    resolvedProjectName(byProject.get(a)![0], projects).localeCompare(resolvedProjectName(byProject.get(b)![0], projects))
  );

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Photos per property, added by browsing Google Drive — no manual link entry.
          Thumbnails are best-effort (Drive session-scoped links can expire); a broken
          thumbnail still links out to the real file.
        </p>
        <Button size="sm" onClick={() => setAdding(true)} className="shrink-0"><Plus className="size-3.5" /> Add Photos</Button>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[12rem]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search caption…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {allCategories.map((c) => (<SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{photos.length} of {allPhotos.length}</span>
      </div>

      {projectKeys.length === 0 && (
        <Card className="p-6 text-center text-sm text-muted-foreground">No photos match your filters.</Card>
      )}

      <div className="flex flex-col gap-6">
        {projectKeys.map((key) => (
          <div key={key}>
            <h3 className="mb-2 text-sm font-semibold text-foreground">{resolvedProjectName(byProject.get(key)![0], projects)}</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {byProject.get(key)!.map((photo) => (
                <Card key={photo.id} className="overflow-hidden p-2">
                  <a href={photo.fileUrl} target="_blank" rel="noopener noreferrer">
                    <PhotoThumbnail photo={photo} />
                  </a>
                  <div className="mt-2 flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <p className="truncate text-xs text-foreground" title={photo.caption}>{photo.caption ?? "Untitled"}</p>
                      {photo.propertyName && <p className="truncate text-[10px] text-muted-foreground">{photo.propertyName}</p>}
                      <p className="text-[10px] text-muted-foreground">{formatDate(photo.dateTaken)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 shrink-0"
                      onClick={() => {
                        deletePhoto(photo.id);
                        showUndoToast("Photo deleted", () => restorePhoto(photo));
                      }}
                    >
                      <Trash2 className="size-3 text-destructive" />
                    </Button>
                  </div>
                  <Badge className="mt-1 bg-muted text-muted-foreground border-transparent text-[10px]">{photo.category.replace(/_/g, " ")}</Badge>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <AddPhotosDialog open={adding} onOpenChange={setAdding} />
    </>
  );
}
