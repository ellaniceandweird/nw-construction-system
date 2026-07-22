"use client";
import * as React from "react";
import Link from "next/link";
import { ExternalLink, ArrowUpRight, ImageOff, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useDocuments } from "@/hooks/use-documents";
import { useDrawings } from "@/hooks/use-drawings";
import { useFieldPhotos } from "@/hooks/use-field-photos";

function PhotoThumbnail({ url, alt }: { url?: string; alt: string }) {
  const [failed, setFailed] = React.useState(!url);
  return (
    <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md bg-muted">
      {failed ? (
        <ImageOff className="size-4 text-muted-foreground" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={alt} className="h-full w-full object-cover" onError={() => setFailed(true)} />
      )}
    </div>
  );
}

export function ProjectRelatedFiles({ projectId }: { projectId: string }) {
  const documents = useDocuments().filter((d) => d.projectId === projectId);
  const drawings = useDrawings().filter((d) => d.projectId === projectId);
  const photos = useFieldPhotos().filter((p) => p.projectId === projectId);

  const nothingYet = documents.length === 0 && drawings.length === 0 && photos.length === 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Documents, Drawings &amp; Photos</CardTitle>
        <Link href="/documents" className="flex items-center gap-1 text-xs text-primary hover:underline">
          Open Documents <ArrowUpRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {nothingYet && (
          <p className="text-sm text-muted-foreground">Nothing logged for this project yet in Documents.</p>
        )}

        {documents.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Documents ({documents.length})</p>
            <div className="flex flex-col gap-1.5">
              {documents.map((d) => (
                <a
                  key={d.id}
                  href={d.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-md border border-border p-2 text-sm hover:bg-accent/40 hover:border-primary/40"
                >
                  <span className="flex items-center gap-1.5 text-foreground">
                    <FileText className="size-3.5 text-muted-foreground" /> {d.title}
                  </span>
                  <ExternalLink className="size-3.5 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>
        )}

        {drawings.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Drawings ({drawings.length})</p>
            <div className="flex flex-col gap-1.5">
              {drawings.map((d) => (
                <a
                  key={d.id}
                  href={d.currentRevisionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-md border border-border p-2 text-sm hover:bg-accent/40 hover:border-primary/40"
                >
                  <span className="text-foreground">{d.drawingNumber} — {d.drawingTitle}</span>
                  <ExternalLink className="size-3.5 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>
        )}

        {photos.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Photos ({photos.length})</p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {photos.slice(0, 12).map((photo) => (
                <a key={photo.id} href={photo.fileUrl} target="_blank" rel="noopener noreferrer">
                  <PhotoThumbnail url={photo.thumbnailUrl} alt={photo.caption ?? ""} />
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
