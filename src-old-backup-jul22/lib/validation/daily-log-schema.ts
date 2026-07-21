import { z } from "zod";

export const dailyLogFormSchema = z.object({
  projectId: z.string().min(1, "Select a project"),
  date: z.string().min(1, "Date is required"),
  weatherCondition: z.enum([
    "clear",
    "cloudy",
    "partly_cloudy",
    "light_rain",
    "heavy_rain",
    "snow",
    "high_winds",
    "fog",
    "storm",
    "extreme_heat",
    "extreme_cold",
  ]),
  preparedBy: z.string().min(2, "Enter who prepared this log"),
  crewAttendance: z
    .array(
      z.object({
        crewName: z.string().min(1, "Name required"),
        trade: z.string().min(1, "Trade required"),
        hoursWorked: z.coerce.number().min(0).max(24),
      })
    )
    .min(1, "Add at least one crew member"),
  activitiesPerformed: z
    .array(
      z.object({
        activityId: z.string().min(1, "Select an activity"),
        description: z.string().min(1, "Description required"),
        hoursWorked: z.coerce.number().min(0).max(24),
        notes: z.string().optional(),
      })
    )
    .min(1, "Add at least one activity"),
  generalNotes: z.string().optional(),
});

export type DailyLogFormValues = z.infer<typeof dailyLogFormSchema>;
