"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import {
  activityFormSchema,
  type ActivityFormValues,
} from "@/lib/validation/activity-schema";
import { addActivity, updateActivity } from "@/lib/scheduling/activity-store";
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
      reset(
        existingActivity
          ? {
              projectId: existingActivity.projectId,
              name: existingActivity.name,
              plannedStart: existingActivity.plannedStart,
              plannedFinish: existingActivity.plannedFinish,
              requiredManpower: existingActivity.requiredManpower,
              status: existingActivity.status,
              isCritical: existingActivity.isCritical,
            }
          : { status: "not_started", isCritical: false }
      );
    }
  }, [open, existingActivity, reset]);

  function onSubmit(values: ActivityFormValues) {
    const project = MOCK_PROJECTS.find((p) => p.id === values.projectId);
    if (existingActivity) {
      updateActivity(existingActivity.id, values);
    } else {
      addActivity(values, project?.projectName ?? "Unknown Project");
    }
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
                {MOCK_PROJECTS.map((p) => (
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {existingActivity ? "Save Changes" : "Add Activity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
