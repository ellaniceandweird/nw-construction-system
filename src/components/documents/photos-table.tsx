"use client";
import * as React from "react";
import { Plus, Trash2, ImageOff } from "lucide-react";
import { useFieldPhotos } from "@/hooks/use-field-photos";
import { deletePhoto, restorePhoto } from "@/lib/documents/photo-store";
import { showUndoToast } from "@/lib/toast/toast-store";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddPhotosDialog } from "@/components/documents/add-photos-dialog";
import type { FieldPhoto } from "@/types/field-operations";

function projectName(id: string) {
  return MOCK_PROJECTS.find((p) => p.id === id)?.projectName ?? id;
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
  const photos = useFieldPhotos();
  const [adding, setAdding] = React.useState(false);

  const byProject = new Map<string, FieldPhoto[]>();
  for (const p of photos) {
    if (!byProject.has(p.projectId)) byProject.set(p.projectId, []);
    byProject.get(p.projectId)!.push(p);
  }
  const projectIds = [...byProject.keys()].sort((a, b) => projectName(a).localeCompare(projectName(b)));

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

      {projectIds.length === 0 && (
        <Card className="p-6 text-center text-sm text-muted-foreground">No photos yet — add some above.</Card>
      )}

      <div className="flex flex-col gap-6">
        {projectIds.map((projectId) => (
          <div key={projectId}>
            <h3 className="mb-2 text-sm font-semibold text-foreground">{projectName(projectId)}</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {byProject.get(projectId)!.map((photo) => (
                <Card key={photo.id} className="overflow-hidden p-2">
                  <a href={photo.fileUrl} target="_blank" rel="noopener noreferrer">
                    <PhotoThumbnail photo={photo} />
                  </a>
                  <div className="mt-2 flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <p className="truncate text-xs text-foreground" title={photo.caption}>{photo.caption ?? "Untitled"}</p>
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
