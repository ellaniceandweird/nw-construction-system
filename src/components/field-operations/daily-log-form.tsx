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
import { getPropertyForProject } from "@/lib/properties/property-relations";
import { useActivities } from "@/hooks/use-activities";
import { useFieldWorkerRates } from "@/hooks/use-field-worker-rates";
import { useProperties } from "@/hooks/use-properties";
import {
  addDailyLog,
  getMostRecentCrew,
  GENERAL_WORK_ACTIVITY_ID,
  MANUAL_ACTIVITY_ID,
  MANUAL_ENTRY,
} from "@/lib/field-operations/daily-log-store";
import {
  dailyLogFormSchema,
  type DailyLogFormValues,
} from "@/lib/validation/daily-log-schema";
import { PreviousDayLogEditor } from "@/components/field-operations/previous-day-log-editor";

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
    propertyId: "",
    propertyName: "",
    projectId: defaultProjectId,
    projectName: "",
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
  const properties = useProperties();
  const seededRef = React.useRef(false);

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
      date: new Date().toISOString().slice(0, 10),
      timeEntries: [],
    },
  });

  const timeEntryFields = useFieldArray({ control, name: "timeEntries" });
  const mainProjectId = watch("projectId");
  const watchedDate = watch("date");

  // Once a main project is picked, auto-populate rows from the most
  // recent daily log's crew — Ella just adjusts project/activity/hours
  // instead of re-picking the same people every morning.
  React.useEffect(() => {
    if (mainProjectId && !seededRef.current) {
      seededRef.current = true;
      const project = MOCK_PROJECTS.find((p) => p.id === mainProjectId);
      const property = project ? getPropertyForProject(project, properties) : undefined;
      const propertyFields = property ? { propertyId: property.id, propertyName: property.name } : {};
      const recentCrew = getMostRecentCrew(watchedDate || new Date().toISOString().slice(0, 10));
      if (recentCrew.length > 0) {
        recentCrew.forEach((entry) => {
          timeEntryFields.append({
            ...emptyTimeEntry(mainProjectId),
            ...propertyFields,
            employeeId: entry.employeeId,
            employeeName: entry.employeeName,
            trade: entry.trade,
          });
        });
      } else {
        timeEntryFields.append({ ...emptyTimeEntry(mainProjectId), ...propertyFields });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainProjectId]);

  function onSubmit(values: DailyLogFormValues) {
    const id = addDailyLog(values);
    setSubmitted(true);
    setTimeout(() => router.push(`/field-operations/${id}`), 800);
  }

  function handleEmployeeChange(index: number, employeeId: string) {
    if (employeeId === MANUAL_ENTRY) {
      setValue(`timeEntries.${index}.employeeId`, MANUAL_ENTRY, { shouldValidate: true });
      setValue(`timeEntries.${index}.employeeName`, "");
      setValue(`timeEntries.${index}.trade`, "");
      return;
    }
    const rate = workerRates.find((r) => r.employeeId === employeeId);
    setValue(`timeEntries.${index}.employeeId`, employeeId, { shouldValidate: true });
    setValue(`timeEntries.${index}.employeeName`, rate?.employeeName ?? "");
    setValue(`timeEntries.${index}.trade`, rate?.trade ?? "");
  }

  function handlePropertyChange(index: number, propertyId: string) {
    if (propertyId === MANUAL_ENTRY) {
      setValue(`timeEntries.${index}.propertyId`, MANUAL_ENTRY);
      setValue(`timeEntries.${index}.propertyName`, "");
      return;
    }
    const property = properties.find((p) => p.id === propertyId);
    setValue(`timeEntries.${index}.propertyId`, propertyId);
    setValue(`timeEntries.${index}.propertyName`, property?.name ?? "");
  }

  function handleProjectChange(index: number, projectId: string) {
    setValue(`timeEntries.${index}.activityId`, "");
    setValue(`timeEntries.${index}.activityDescription`, "");
    if (projectId === MANUAL_ENTRY) {
      setValue(`timeEntries.${index}.projectId`, MANUAL_ENTRY, { shouldValidate: true });
      setValue(`timeEntries.${index}.projectName`, "");
      return;
    }
    setValue(`timeEntries.${index}.projectId`, projectId, { shouldValidate: true });
    setValue(`timeEntries.${index}.projectName`, "");

    const project = MOCK_PROJECTS.find((p) => p.id === projectId);
    const property = project ? getPropertyForProject(project, properties) : undefined;
    if (property) {
      setValue(`timeEntries.${index}.propertyId`, property.id);
      setValue(`timeEntries.${index}.propertyName`, property.name);
    } else {
      setValue(`timeEntries.${index}.propertyId`, "");
      setValue(`timeEntries.${index}.propertyName`, "");
    }
  }

  function handleActivityChange(index: number, projectId: string, activityId: string) {
    setValue(`timeEntries.${index}.activityId`, activityId, { shouldValidate: true });
    if (activityId === GENERAL_WORK_ACTIVITY_ID) {
      setValue(`timeEntries.${index}.activityDescription`, "General Work");
    } else if (activityId === MANUAL_ACTIVITY_ID) {
      setValue(`timeEntries.${index}.activityDescription`, "");
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
              Worker rows are pre-filled from the last daily log — adjust property, project,
              activity, and hours below, delete anyone not working today, or add someone new.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const project = MOCK_PROJECTS.find((p) => p.id === mainProjectId);
              const property = project ? getPropertyForProject(project, properties) : undefined;
              timeEntryFields.append({
                ...emptyTimeEntry(mainProjectId ?? ""),
                ...(property ? { propertyId: property.id, propertyName: property.name } : {}),
              });
            }}
          >
            <Plus /> Add Row
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-2 py-2 font-medium">Worker&apos;s Name</th>
                <th className="px-2 py-2 font-medium">Property</th>
                <th className="px-2 py-2 font-medium">Project</th>
                <th className="px-2 py-2 font-medium">Activity</th>
                <th className="px-2 py-2 font-medium w-20">Reg Hrs</th>
                <th className="px-2 py-2 font-medium w-20">OT Hrs</th>
                <th className="px-2 py-2 font-medium">Notes</th>
                <th className="px-2 py-2 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody>
              {timeEntryFields.fields.map((field, index) => {
                const rowProjectId = watch(`timeEntries.${index}.projectId`);
                const rowActivities = allActivities.filter((a) => a.projectId === rowProjectId);
                const employeeId = watch(`timeEntries.${index}.employeeId`);
                const propertyId = watch(`timeEntries.${index}.propertyId`);
                const activityId = watch(`timeEntries.${index}.activityId`);

                return (
                  <tr key={field.id} className="border-b border-border/60 last:border-0 align-top">
                    <td className="px-2 py-2">
                      <Select value={employeeId} onValueChange={(v) => handleEmployeeChange(index, v)}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Select worker" /></SelectTrigger>
                        <SelectContent>
                          {workerRates.map((r) => (
                            <SelectItem key={r.employeeId} value={r.employeeId}>{r.employeeName} — {r.trade}</SelectItem>
                          ))}
                          <SelectItem value={MANUAL_ENTRY}>Manual entry…</SelectItem>
                        </SelectContent>
                      </Select>
                      {employeeId === MANUAL_ENTRY && (
                        <Input
                          className="mt-1"
                          placeholder="Type worker's name"
                          {...register(`timeEntries.${index}.employeeName`)}
                        />
                      )}
                      {fieldError(errors.timeEntries?.[index]?.employeeId?.message)}
                    </td>

                    <td className="px-2 py-2">
                      <Select value={propertyId} onValueChange={(v) => handlePropertyChange(index, v)}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Select property" /></SelectTrigger>
                        <SelectContent>
                          {properties.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                          <SelectItem value={MANUAL_ENTRY}>Manual entry…</SelectItem>
                        </SelectContent>
                      </Select>
                      {propertyId === MANUAL_ENTRY && (
                        <Input
                          className="mt-1"
                          placeholder="Type property name"
                          {...register(`timeEntries.${index}.propertyName`)}
                        />
                      )}
                    </td>

                    <td className="px-2 py-2">
                      <Select value={rowProjectId} onValueChange={(v) => handleProjectChange(index, v)}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Select project" /></SelectTrigger>
                        <SelectContent>
                          {MOCK_PROJECTS.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>
                          ))}
                          <SelectItem value={MANUAL_ENTRY}>Manual entry…</SelectItem>
                        </SelectContent>
                      </Select>
                      {rowProjectId === MANUAL_ENTRY && (
                        <Input
                          className="mt-1"
                          placeholder="Type project name"
                          {...register(`timeEntries.${index}.projectName`)}
                        />
                      )}
                      {fieldError(errors.timeEntries?.[index]?.projectId?.message)}
                    </td>

                    <td className="px-2 py-2">
                      <Select
                        value={activityId}
                        onValueChange={(v) => handleActivityChange(index, rowProjectId, v)}
                        disabled={!rowProjectId}
                      >
                        <SelectTrigger className="w-full"><SelectValue placeholder={rowProjectId ? "Select activity" : "Pick a project first"} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value={GENERAL_WORK_ACTIVITY_ID}>General Work</SelectItem>
                          {rowActivities.map((a) => (
                            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                          ))}
                          <SelectItem value={MANUAL_ACTIVITY_ID}>Manual entry…</SelectItem>
                        </SelectContent>
                      </Select>
                      {activityId === MANUAL_ACTIVITY_ID && (
                        <Input
                          className="mt-1"
                          placeholder="Type activity"
                          {...register(`timeEntries.${index}.activityDescription`)}
                        />
                      )}
                      {fieldError(errors.timeEntries?.[index]?.activityId?.message)}
                    </td>

                    <td className="px-2 py-2">
                      <Input type="number" className="w-20" {...register(`timeEntries.${index}.regularHours`)} />
                    </td>
                    <td className="px-2 py-2">
                      <Input type="number" className="w-20" {...register(`timeEntries.${index}.overtimeHours`)} />
                    </td>
                    <td className="px-2 py-2">
                      <Input
                        placeholder="Optional"
                        {...register(`timeEntries.${index}.notes`)}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => timeEntryFields.remove(index)}
                        disabled={timeEntryFields.fields.length === 1}
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {fieldError(errors.timeEntries?.message)}
        </CardContent>
      </Card>

      <PreviousDayLogEditor currentDate={watchedDate} />

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
