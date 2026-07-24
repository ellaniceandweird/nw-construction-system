"use client";

import * as React from "react";

import { Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProperties } from "@/hooks/use-properties";
import { updateTask, deleteMaintenanceTask, restoreMaintenanceTask } from "@/lib/maintenance/maintenance-task-store";
import { showUndoToast } from "@/lib/toast/toast-store";
import type {
  MaintenanceTask,
  MaintenancePriority,
  MaintenanceTaskStatus,
} from "@/types/maintenance";

interface Props {
  task: MaintenanceTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MaintenanceTaskEditDialog({ task, open, onOpenChange }: Props) {
  const properties = useProperties();
  const [propertyName, setPropertyName] = React.useState("");
  const [taskDescription, setTaskDescription] = React.useState("");
  const [priority, setPriority] = React.useState<MaintenancePriority>("medium");
  const [taskStatus, setTaskStatus] = React.useState<MaintenanceTaskStatus>("not_started");
  const [responsibleParty, setResponsibleParty] = React.useState("");
  const [plannedCompletionDate, setPlannedCompletionDate] = React.useState("");
  const [comments, setComments] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  React.useEffect(() => {
    if (task) {
      setPropertyName(task.propertyName ?? "");
      setTaskDescription(task.taskDescription);
      setPriority(task.priority ?? "medium");
      setTaskStatus(task.taskStatus);
      setResponsibleParty(task.responsibleParty ?? "");
      setPlannedCompletionDate(task.plannedCompletionDate ?? "");
      setComments(task.comments ?? "");
      setConfirmingDelete(false);
    }
  }, [task]);

  function handleDelete() {
    if (!task) return;
    const removed = task;
    deleteMaintenanceTask(task.id);
    showUndoToast("Maintenance task deleted", () => restoreMaintenanceTask(removed));
    onOpenChange(false);
  }

  function handleSave() {
    if (!task) return;
    updateTask(task.id, {
      propertyName,
      taskDescription,
      priority,
      taskStatus,
      responsibleParty,
      plannedCompletionDate,
      comments,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Maintenance Task</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <Label>Property</Label>
            <Select value={propertyName} onValueChange={setPropertyName}>
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.name}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="taskDescription">Task Description</Label>
            <Input
              id="taskDescription"
              className="mt-1.5"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as MaintenancePriority)}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="long_term_project">Long Term Project</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={taskStatus} onValueChange={(v) => setTaskStatus(v as MaintenanceTaskStatus)}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="working_on">Working On</SelectItem>
                  <SelectItem value="stuck">Stuck</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="responsibleParty">Responsible</Label>
              <Input
                id="responsibleParty"
                className="mt-1.5"
                value={responsibleParty}
                onChange={(e) => setResponsibleParty(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="plannedCompletionDate">Target Completion</Label>
              <Input
                id="plannedCompletionDate"
                type="date"
                className="mt-1.5"
                value={plannedCompletionDate}
                onChange={(e) => setPlannedCompletionDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="comments">Notes</Label>
            <Textarea
              id="comments"
              className="mt-1.5"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          {confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete this task?</span>
              <Button variant="destructive" size="sm" onClick={handleDelete}>Confirm Delete</Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmingDelete(true)}>
              <Trash2 className="size-3.5" /> Delete
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
