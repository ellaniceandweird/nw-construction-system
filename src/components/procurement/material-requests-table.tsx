"use client";

import * as React from "react";
import { Pencil, Paperclip, Plus } from "lucide-react";

import { useMaterialRequests } from "@/hooks/use-material-requests";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MaterialRequestEditDialog } from "@/components/procurement/material-request-edit-dialog";
import { MaterialRequestCreateDialog } from "@/components/procurement/material-request-create-dialog";
import type { MaterialRequest } from "@/types/procurement";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function MaterialRequestsTable() {
  const requests = useMaterialRequests();
  const [editingRequest, setEditingRequest] = React.useState<MaterialRequest | null>(null);
  const [creating, setCreating] = React.useState(false);

  const sorted = [...requests].sort(
    (a, b) => new Date(a.requiredOnSiteDate).getTime() - new Date(b.requiredOnSiteDate).getTime()
  );

  return (
    <>
      <div className="mb-3 flex justify-end">
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="size-3.5" /> Add Entry
        </Button>
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">MR Number</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Needed By</th>
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Notes</th>
              <th className="px-4 py-3 font-medium">Edit</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((mr) => {
              const project = MOCK_PROJECTS.find((p) => p.id === mr.projectId);
              return (
                <tr key={mr.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                  <td className="px-4 py-3 font-medium text-foreground">{mr.mrNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{project?.projectName ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {mr.lineItems[0]?.description}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(mr.requiredOnSiteDate)}
                  </td>
                  <td className="px-4 py-3">
                    {mr.referenceUrl ? (
                      <a
                        href={mr.referenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <Paperclip className="size-3.5" /> View
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs">{mr.notes ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" onClick={() => setEditingRequest(mr)}>
                      <Pencil className="size-3.5" />
                    </Button>
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">No material requests yet — click &quot;Add Entry&quot; above.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <MaterialRequestEditDialog
        request={editingRequest}
        open={!!editingRequest}
        onOpenChange={(open) => !open && setEditingRequest(null)}
      />
      <MaterialRequestCreateDialog open={creating} onOpenChange={setCreating} />
    </>
  );
}
