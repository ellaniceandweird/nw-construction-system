"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjects } from "@/hooks/use-projects";
import {
  activityFormSchema,
  type ActivityFormValues,
} from "@/lib/validation/activity-schema";
import { addActivity, updateActivity, deleteActivity } from "@/lib/scheduling/activity-store";
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast-store";
import type { Activity } from "@/types/scheduling";

function fieldError(message?: string) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

const STATUS_OPTIONS: { value: ActivityFormValues["status"]; label: string }[] = [
  { value: "not_started", label: "Not Started" },
  { value: "ready", label: "Ready" },
  { value: "in_progress", label: "In Progress" },
  { value: "delayed", label: "Delayed" },
  { value: "blocked", label: "Blocked" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

interface ActivityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingActivity?: Activity;
}

export function ActivityFormDialog({
  open,
  onOpenChange,
  existingActivity,
}: ActivityFormDialogProps) {
  const projects = useProjects();
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: existingActivity
      ? {
          projectId: existingActivity.projectId,
          name: existingActivity.name,
          plannedStart: existingActivity.plannedStart,
          plannedFinish: existingActivity.plannedFinish,
          actualStart: existingActivity.actualStart,
          actualFinish: existingActivity.actualFinish,
          requiredManpower: existingActivity.requiredManpower,
          status: existingActivity.status,
          isCritical: existingActivity.isCritical,
        }
      : {
          status: "not_started",
          isCritical: false,
        },
  });

  // Reset form whenever we switch between add / a different activity to edit
  React.useEffect(() => {
    if (open) {
      setConfirmingDelete(false);
      reset(
        existingActivity
          ? {
              projectId: existingActivity.projectId,
              name: existingActivity.name,
              plannedStart: existingActivity.plannedStart,
              plannedFinish: existingActivity.plannedFinish,
              actualStart: existingActivity.actualStart,
              actualFinish: existingActivity.actualFinish,
              requiredManpower: existingActivity.requiredManpower,
              status: existingActivity.status,
              isCritical: existingActivity.isCritical,
            }
          : { status: "not_started", isCritical: false }
      );
    }
  }, [open, existingActivity, reset]);

  async function onSubmit(values: ActivityFormValues) {
    const project = projects.find((p) => p.id === values.projectId);
    setSaving(true);
    const result = existingActivity
      ? await updateActivity(existingActivity.id, values)
      : await addActivity(values, project?.projectName ?? "Unknown Project");
    setSaving(false);
    if (!result.ok) {
      showErrorToast(result.error ? `Couldn't save: ${result.error}` : "Couldn't save this activity — check your connection and try again.");
      return;
    }
    showSuccessToast(existingActivity ? "Activity updated" : "Activity added");
    onOpenChange(false);
  }

  function handleDelete() {
    if (!existingActivity) return;
    deleteActivity(existingActivity.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existingActivity ? "Edit Activity" : "Add Activity"}</DialogTitle>
          <DialogDescription>
            Changes here update the Master Schedule immediately — every lookahead,
            weekly, and daily view regenerates automatically from this data.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <Label>Project</Label>
            <Select
              value={watch("projectId")}
              onValueChange={(v) => setValue("projectId", v, { shouldValidate: true })}
            >
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.projectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldError(errors.projectId?.message)}
          </div>

          <div>
            <Label htmlFor="name">Activity Name</Label>
            <Input id="name" className="mt-1.5" {...register("name")} />
            {fieldError(errors.name?.message)}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="plannedStart">Planned Start</Label>
              <Input
                id="plannedStart"
                type="date"
                className="mt-1.5"
                {...register("plannedStart")}
              />
              {fieldError(errors.plannedStart?.message)}
            </div>
            <div>
              <Label htmlFor="plannedFinish">Planned Finish</Label>
              <Input
                id="plannedFinish"
                type="date"
                className="mt-1.5"
                {...register("plannedFinish")}
              />
              {fieldError(errors.plannedFinish?.message)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="actualStart">Actual Start (optional)</Label>
              <Input
                id="actualStart"
                type="date"
                className="mt-1.5"
                {...register("actualStart")}
              />
            </div>
            <div>
              <Label htmlFor="actualFinish">Actual Finish (optional)</Label>
              <Input
                id="actualFinish"
                type="date"
                className="mt-1.5"
                {...register("actualFinish")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="requiredManpower">Manpower Needed</Label>
              <Input
                id="requiredManpower"
                type="number"
                className="mt-1.5"
                {...register("requiredManpower")}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(v) =>
                  setValue("status", v as ActivityFormValues["status"], { shouldValidate: true })
                }
              >
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="isCritical"
              checked={watch("isCritical")}
              onCheckedChange={(checked) => setValue("isCritical", checked === true)}
            />
            <Label htmlFor="isCritical" className="font-normal">
              This is a critical-path activity
            </Label>
          </div>

          <DialogFooter className="justify-between">
            {existingActivity ? (confirmingDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Delete this activity?</span>
                <Button type="button" variant="destructive" size="sm" onClick={handleDelete}>Confirm Delete</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => setConfirmingDelete(true)}
              >
                <Trash2 className="size-3.5" /> Delete
              </Button>
            )) : <span />}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || saving}>
                {saving ? "Saving…" : existingActivity ? "Save Changes" : "Add Activity"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
