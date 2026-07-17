"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { useActivities } from "@/hooks/use-activities";
import { addDailyLog, GENERAL_WORK_ACTIVITY_ID } from "@/lib/field-operations/daily-log-store";
import {
  dailyLogFormSchema,
  type DailyLogFormValues,
} from "@/lib/validation/daily-log-schema";

function fieldError(message?: string) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

const WEATHER_OPTIONS: { value: DailyLogFormValues["weatherCondition"]; label: string }[] = [
  { value: "clear", label: "Clear" },
  { value: "partly_cloudy", label: "Partly Cloudy" },
  { value: "cloudy", label: "Cloudy" },
  { value: "light_rain", label: "Light Rain" },
  { value: "heavy_rain", label: "Heavy Rain" },
  { value: "high_winds", label: "High Winds" },
  { value: "snow", label: "Snow" },
  { value: "fog", label: "Fog" },
  { value: "storm", label: "Storm" },
  { value: "extreme_heat", label: "Extreme Heat" },
  { value: "extreme_cold", label: "Extreme Cold" },
];

export function DailyLogForm() {
  const router = useRouter();
  const [submitted, setSubmitted] = React.useState(false);
  const allActivities = useActivities();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DailyLogFormValues>({
    resolver: zodResolver(dailyLogFormSchema),
    defaultValues: {
      weatherCondition: "clear",
      crewAttendance: [{ crewName: "", trade: "", hoursWorked: 8 }],
      activitiesPerformed: [{ activityId: "", description: "", hoursWorked: 8, notes: "" }],
    },
  });

  const crewFields = useFieldArray({ control, name: "crewAttendance" });
  const activityFields = useFieldArray({ control, name: "activitiesPerformed" });

  const selectedProjectId = watch("projectId");
  const projectActivities = allActivities.filter((a) => a.projectId === selectedProjectId);

  function onSubmit(values: DailyLogFormValues) {
    const id = addDailyLog(values);
    setSubmitted(true);
    setTimeout(() => router.push(`/field-operations/${id}`), 800);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Card>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" className="mt-1.5" {...register("date")} />
            {fieldError(errors.date?.message)}
          </div>

          <div>
            <Label>Weather</Label>
            <Select
              value={watch("weatherCondition")}
              onValueChange={(v) =>
                setValue("weatherCondition", v as DailyLogFormValues["weatherCondition"])
              }
            >
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEATHER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="preparedBy">Prepared By</Label>
            <Input id="preparedBy" className="mt-1.5" {...register("preparedBy")} />
            {fieldError(errors.preparedBy?.message)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Crew Attendance</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => crewFields.append({ crewName: "", trade: "", hoursWorked: 8 })}
          >
            <Plus /> Add Worker
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {crewFields.fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_100px_auto] sm:items-end">
              <div>
                <Label className="text-xs">Name</Label>
                <Input className="mt-1" {...register(`crewAttendance.${index}.crewName`)} />
              </div>
              <div>
                <Label className="text-xs">Trade</Label>
                <Input className="mt-1" {...register(`crewAttendance.${index}.trade`)} />
              </div>
              <div>
                <Label className="text-xs">Hours</Label>
                <Input
                  type="number"
                  className="mt-1"
                  {...register(`crewAttendance.${index}.hoursWorked`)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => crewFields.remove(index)}
                disabled={crewFields.fields.length === 1}
              >
                <Trash2 className="size-3.5 text-destructive" />
              </Button>
            </div>
          ))}
          {fieldError(errors.crewAttendance?.message)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Activities Performed</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => activityFields.append({ activityId: "", description: "", hoursWorked: 8, notes: "" })}
          >
            <Plus /> Add Activity
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {activityFields.fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_100px_auto] sm:items-end">
              <div>
                <Label className="text-xs">Activity</Label>
                <Select
                  value={watch(`activitiesPerformed.${index}.activityId`)}
                  onValueChange={(v) => {
                    setValue(`activitiesPerformed.${index}.activityId`, v, { shouldValidate: true });
                    if (v === GENERAL_WORK_ACTIVITY_ID) {
                      setValue(`activitiesPerformed.${index}.description`, "General Work");
                    } else {
                      const activity = projectActivities.find((a) => a.id === v);
                      setValue(`activitiesPerformed.${index}.description`, activity?.name ?? "");
                    }
                  }}
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder={selectedProjectId ? "Select an activity" : "Select a project first"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={GENERAL_WORK_ACTIVITY_ID}>General Work</SelectItem>
                    {projectActivities.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldError(errors.activitiesPerformed?.[index]?.activityId?.message)}
              </div>
              <div>
                <Label className="text-xs">Notes (optional)</Label>
                <Input
                  className="mt-1"
                  placeholder="Anything worth noting manually"
                  {...register(`activitiesPerformed.${index}.notes`)}
                />
              </div>
              <div>
                <Label className="text-xs">Hours</Label>
                <Input
                  type="number"
                  className="mt-1"
                  {...register(`activitiesPerformed.${index}.hoursWorked`)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => activityFields.remove(index)}
                disabled={activityFields.fields.length === 1}
              >
                <Trash2 className="size-3.5 text-destructive" />
              </Button>
            </div>
          ))}
          {fieldError(errors.activitiesPerformed?.message)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Any additional notes about today's work..."
            {...register("generalNotes")}
          />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          Save Daily Log
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/field-operations")}>
          Cancel
        </Button>
        {submitted && <span className="text-sm text-success">Saved! Redirecting…</span>}
      </div>
    </form>
  );
}
