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
import { useFieldWorkerRates } from "@/hooks/use-field-worker-rates";
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

function emptyTimeEntry(defaultProjectId: string) {
  return {
    employeeId: "",
    employeeName: "",
    trade: "",
    status: "present" as const,
    projectId: defaultProjectId,
    activityId: "",
    activityDescription: "",
    regularHours: 8,
    overtimeHours: 0,
    notes: "",
  };
}

export function DailyLogForm() {
  const router = useRouter();
  const [submitted, setSubmitted] = React.useState(false);
  const allActivities = useActivities();
  const workerRates = useFieldWorkerRates();

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
      timeEntries: [],
    },
  });

  const timeEntryFields = useFieldArray({ control, name: "timeEntries" });
  const mainProjectId = watch("projectId");

  // Once a main project is picked, seed the first time entry row so the
  // form isn't empty — subsequent rows can still point at other projects.
  React.useEffect(() => {
    if (mainProjectId && timeEntryFields.fields.length === 0) {
      timeEntryFields.append(emptyTimeEntry(mainProjectId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainProjectId]);

  function onSubmit(values: DailyLogFormValues) {
    const id = addDailyLog(values);
    setSubmitted(true);
    setTimeout(() => router.push(`/field-operations/${id}`), 800);
  }

  function handleEmployeeChange(index: number, employeeId: string) {
    const rate = workerRates.find((r) => r.employeeId === employeeId);
    setValue(`timeEntries.${index}.employeeId`, employeeId, { shouldValidate: true });
    setValue(`timeEntries.${index}.employeeName`, rate?.employeeName ?? "");
    setValue(`timeEntries.${index}.trade`, rate?.trade ?? "");
  }

  function handleActivityChange(index: number, projectId: string, activityId: string) {
    setValue(`timeEntries.${index}.activityId`, activityId, { shouldValidate: true });
    if (activityId === GENERAL_WORK_ACTIVITY_ID) {
      setValue(`timeEntries.${index}.activityDescription`, "General Work");
    } else {
      const activity = allActivities.find((a) => a.id === activityId && a.projectId === projectId);
      setValue(`timeEntries.${index}.activityDescription`, activity?.name ?? "");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Card>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Primary Project</Label>
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
            <p className="mt-1 text-xs text-muted-foreground">
              Just the default for new rows below — any worker can still be logged against a different project.
            </p>
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
          <div>
            <CardTitle>Time Entries</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              One row per worker per project/activity — if someone split their day across two
              projects, just add a second row for that same person with the other project.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => timeEntryFields.append(emptyTimeEntry(mainProjectId ?? ""))}
          >
            <Plus /> Add Row
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {timeEntryFields.fields.map((field, index) => {
            const rowProjectId = watch(`timeEntries.${index}.projectId`);
            const rowActivities = allActivities.filter((a) => a.projectId === rowProjectId);
            return (
              <div key={field.id} className="rounded-lg border border-border p-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs">Employee</Label>
                    <Select
                      value={watch(`timeEntries.${index}.employeeId`)}
                      onValueChange={(v) => handleEmployeeChange(index, v)}
                    >
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue placeholder="Select an employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {workerRates.map((r) => (
                          <SelectItem key={r.employeeId} value={r.employeeId}>
                            {r.employeeName} — {r.trade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldError(errors.timeEntries?.[index]?.employeeId?.message)}
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Not listed? Add them in References &gt; Field Worker Rates first.
                    </p>
                  </div>

                  <div>
                    <Label className="text-xs">Project</Label>
                    <Select
                      value={rowProjectId}
                      onValueChange={(v) => {
                        setValue(`timeEntries.${index}.projectId`, v, { shouldValidate: true });
                        setValue(`timeEntries.${index}.activityId`, "");
                        setValue(`timeEntries.${index}.activityDescription`, "");
                      }}
                    >
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_PROJECTS.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldError(errors.timeEntries?.[index]?.projectId?.message)}
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_80px_80px_1fr_auto] sm:items-end">
                  <div>
                    <Label className="text-xs">Activity</Label>
                    <Select
                      value={watch(`timeEntries.${index}.activityId`)}
                      onValueChange={(v) => handleActivityChange(index, rowProjectId, v)}
                    >
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue placeholder={rowProjectId ? "Select an activity" : "Pick a project first"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={GENERAL_WORK_ACTIVITY_ID}>General Work</SelectItem>
                        {rowActivities.map((a) => (
                          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldError(errors.timeEntries?.[index]?.activityId?.message)}
                  </div>
                  <div>
                    <Label className="text-xs">Reg Hrs</Label>
                    <Input type="number" className="mt-1" {...register(`timeEntries.${index}.regularHours`)} />
                  </div>
                  <div>
                    <Label className="text-xs">OT Hrs</Label>
                    <Input type="number" className="mt-1" {...register(`timeEntries.${index}.overtimeHours`)} />
                  </div>
                  <div>
                    <Label className="text-xs">Notes (optional)</Label>
                    <Input
                      className="mt-1"
                      placeholder="Anything worth noting manually"
                      {...register(`timeEntries.${index}.notes`)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => timeEntryFields.remove(index)}
                    disabled={timeEntryFields.fields.length === 1}
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
          {fieldError(errors.timeEntries?.message)}
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
