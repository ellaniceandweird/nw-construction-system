"use client";
import * as React from "react";
import Link from "next/link";
import { Building2, ArrowUpRight } from "lucide-react";
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
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="group flex items-center justify-between rounded-md border border-border p-2.5 text-sm hover:bg-accent/40 hover:border-primary/40"
                  >
                    <div>
                      <p className="font-medium text-foreground group-hover:text-primary">{p.projectName}</p>
                      <p className="text-xs text-muted-foreground">{p.projectNumber}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${PROJECT_STATUS_CLASS[p.status] ?? "bg-muted text-muted-foreground"} border-transparent`}>
                        {p.status.replace(/_/g, " ")}
                      </Badge>
                      <ArrowUpRight className="size-3.5 text-muted-foreground group-hover:text-primary" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="mb-1 text-sm font-semibold text-foreground">
              Maintenance History
              {history.tasks.length + history.schedules.length + history.logEntries.length === 0 && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">— nothing logged yet</span>
              )}
            </h4>
            {history.tasks.length + history.schedules.length + history.logEntries.length > 0 && (
              <p className="mb-2 text-xs text-muted-foreground">Click any item to open it in Maintenance.</p>
            )}

            {openTasks.length > 0 && (
              <div className="mb-3">
                <Link href="/maintenance?tab=general" className="group mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary">
                  Open Tasks <ArrowUpRight className="size-3 opacity-0 group-hover:opacity-100" />
                </Link>
                <div className="flex flex-col gap-1.5">
                  {openTasks.map((t) => (
                    <Link
                      key={t.id}
                      href="/maintenance?tab=general"
                      className="flex items-center justify-between rounded-md border border-border p-2 text-sm hover:bg-accent/40 hover:border-primary/40"
                    >
                      <span className="text-foreground">{t.taskDescription}</span>
                      <Badge className={`${TASK_STATUS_CLASS[t.taskStatus]} border-transparent text-[10px]`}>{t.taskStatus.replace(/_/g, " ")}</Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {closedTasks.length > 0 && (
              <div className="mb-3">
                <Link href="/maintenance?tab=general" className="group mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary">
                  Completed Tasks ({closedTasks.length}) <ArrowUpRight className="size-3 opacity-0 group-hover:opacity-100" />
                </Link>
                <div className="flex flex-col gap-1.5">
                  {closedTasks.slice(0, 5).map((t) => (
                    <Link
                      key={t.id}
                      href="/maintenance?tab=general"
                      className="flex items-center justify-between rounded-md border border-border/60 p-2 text-xs text-muted-foreground hover:bg-accent/40 hover:border-primary/40"
                    >
                      <span>{t.taskDescription}</span>
                      <span>{formatDate(t.dateCompleted)}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {history.schedules.length > 0 && (
              <div className="mb-3">
                <Link href="/maintenance?tab=recurring" className="group mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary">
                  Equipment Schedules <ArrowUpRight className="size-3 opacity-0 group-hover:opacity-100" />
                </Link>
                <div className="flex flex-col gap-1.5">
                  {history.schedules.map((s) => (
                    <Link
                      key={s.id}
                      href="/maintenance?tab=recurring"
                      className="block rounded-md border border-border p-2 text-xs hover:bg-accent/40 hover:border-primary/40"
                    >
                      <p className="font-medium text-foreground">{s.systemType} — {s.location}</p>
                      <p className="text-muted-foreground">
                        {s.frequency ? `Every ${s.frequency}` : "No set frequency"} · Last done: {formatDate(s.lastCompleted)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {history.logEntries.length > 0 && (
              <div>
                <Link href="/maintenance?tab=log" className="group mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary">
                  Recent Activity <ArrowUpRight className="size-3 opacity-0 group-hover:opacity-100" />
                </Link>
                <div className="flex flex-col gap-1.5">
                  {history.logEntries.slice(0, 5).map((l) => (
                    <Link
                      key={l.id}
                      href="/maintenance?tab=log"
                      className="block rounded-md border border-border/60 p-2 text-xs text-muted-foreground hover:bg-accent/40 hover:border-primary/40"
                    >
                      <span className="font-medium text-foreground">{formatDate(l.timestamp)}</span> — {l.description}
                      {l.detail && <span className="block">{l.detail}</span>}
                    </Link>
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
