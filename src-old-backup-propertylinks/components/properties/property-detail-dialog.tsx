"use client";
import * as React from "react";
import { Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DrivePickerButton } from "@/components/shared/drive-picker-button";
import { updateProperty } from "@/lib/properties/property-store";
import { getRelatedProjects, getMaintenanceHistory } from "@/lib/properties/property-relations";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { useMaintenanceTasks } from "@/hooks/use-maintenance-tasks";
import { useEquipmentMaintenance } from "@/hooks/use-equipment-maintenance";
import { useMaintenanceLog } from "@/hooks/use-maintenance-log";
import type { Property } from "@/types/maintenance";
import type { DrivePickedFile } from "@/lib/google-drive/use-drive-picker";

interface Props {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TASK_STATUS_CLASS: Record<string, string> = {
  working_on: "bg-info-soft text-info-foreground",
  not_started: "bg-muted text-muted-foreground",
  stuck: "bg-destructive-soft text-destructive",
  complete: "bg-success-soft text-success",
};
const PROJECT_STATUS_CLASS: Record<string, string> = {
  active: "bg-info-soft text-info-foreground",
  on_hold: "bg-warning-soft text-warning-foreground",
  completed: "bg-success-soft text-success",
  cancelled: "bg-muted text-muted-foreground",
};

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function PropertyDetailDialog({ property, open, onOpenChange }: Props) {
  const tasks = useMaintenanceTasks();
  const schedules = useEquipmentMaintenance();
  const logEntries = useMaintenanceLog();

  const [address, setAddress] = React.useState("");
  const [town, setTown] = React.useState("");
  const [editingInfo, setEditingInfo] = React.useState(false);

  React.useEffect(() => {
    if (property && open) {
      setAddress(property.address ?? "");
      setTown(property.town ?? "");
      setEditingInfo(false);
    }
  }, [property, open]);

  if (!property) return null;

  const relatedProjects = getRelatedProjects(property, MOCK_PROJECTS);
  const history = getMaintenanceHistory(property, tasks, schedules, logEntries);
  const openTasks = history.tasks.filter((t) => t.taskStatus !== "complete");
  const closedTasks = history.tasks.filter((t) => t.taskStatus === "complete");

  function handleCoverPhotoSelect(files: DrivePickedFile[]) {
    const file = files[0];
    if (!file || !property) return;
    updateProperty(property.id, { coverPhotoUrl: file.thumbnailUrl ?? file.url });
  }
  function handleSaveInfo() {
    if (!property) return;
    updateProperty(property.id, { address: address || undefined, town: town || undefined });
    setEditingInfo(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{property.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div>
            <div className="flex aspect-[16/7] items-center justify-center overflow-hidden rounded-lg bg-muted">
              {property.coverPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={property.coverPhotoUrl} alt={property.name} className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
              ) : (
                <Building2 className="size-12 text-muted-foreground" />
              )}
            </div>
            <div className="mt-2">
              <DrivePickerButton onSelect={handleCoverPhotoSelect} imagesOnly label="Set Cover Photo" />
            </div>
          </div>

          <div>
            {editingInfo ? (
              <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
                <div>
                  <Label className="text-xs">Address</Label>
                  <Input className="mt-1" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Town</Label>
                  <Input className="mt-1" value={town} onChange={(e) => setTown(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveInfo}>Save</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingInfo(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <button className="flex w-full items-center justify-between rounded-lg border border-dashed border-border p-3 text-left hover:bg-accent/40" onClick={() => setEditingInfo(true)}>
                <span className="text-sm text-muted-foreground">
                  {property.address || property.town ? `${property.address ?? ""}${property.address && property.town ? ", " : ""}${property.town ?? ""}` : "Add address / town"}
                </span>
                <span className="text-xs text-primary">Edit</span>
              </button>
            )}
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-foreground">Related Projects</h4>
            {relatedProjects.length === 0 ? (
              <p className="text-xs text-muted-foreground">No construction projects matched to this property.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {relatedProjects.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-md border border-border p-2.5 text-sm">
                    <div>
                      <p className="font-medium text-foreground">{p.projectName}</p>
                      <p className="text-xs text-muted-foreground">{p.projectNumber}</p>
                    </div>
                    <Badge className={`${PROJECT_STATUS_CLASS[p.status] ?? "bg-muted text-muted-foreground"} border-transparent`}>
                      {p.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-foreground">
              Maintenance History
              {history.tasks.length + history.schedules.length + history.logEntries.length === 0 && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">— nothing logged yet</span>
              )}
            </h4>

            {openTasks.length > 0 && (
              <div className="mb-3">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Open Tasks</p>
                <div className="flex flex-col gap-1.5">
                  {openTasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded-md border border-border p-2 text-sm">
                      <span className="text-foreground">{t.taskDescription}</span>
                      <Badge className={`${TASK_STATUS_CLASS[t.taskStatus]} border-transparent text-[10px]`}>{t.taskStatus.replace(/_/g, " ")}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {closedTasks.length > 0 && (
              <div className="mb-3">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Completed Tasks ({closedTasks.length})</p>
                <div className="flex flex-col gap-1.5">
                  {closedTasks.slice(0, 5).map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded-md border border-border/60 p-2 text-xs text-muted-foreground">
                      <span>{t.taskDescription}</span>
                      <span>{formatDate(t.dateCompleted)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {history.schedules.length > 0 && (
              <div className="mb-3">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Equipment Schedules</p>
                <div className="flex flex-col gap-1.5">
                  {history.schedules.map((s) => (
                    <div key={s.id} className="rounded-md border border-border p-2 text-xs">
                      <p className="font-medium text-foreground">{s.systemType} — {s.location}</p>
                      <p className="text-muted-foreground">
                        {s.frequency ? `Every ${s.frequency}` : "No set frequency"} · Last done: {formatDate(s.lastCompleted)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {history.logEntries.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Recent Activity</p>
                <div className="flex flex-col gap-1.5">
                  {history.logEntries.slice(0, 5).map((l) => (
                    <div key={l.id} className="rounded-md border border-border/60 p-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{formatDate(l.timestamp)}</span> — {l.description}
                      {l.detail && <span className="block">{l.detail}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
