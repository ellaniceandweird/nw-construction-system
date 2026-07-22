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
  timeEntries: z
    .array(
      z.object({
        employeeId: z.string().min(1, "Select an employee"),
        employeeName: z.string().min(1),
        trade: z.string().optional(),
        status: z.enum(["present", "absent", "late"]),
        propertyId: z.string().optional(),
        propertyName: z.string().optional(),
        projectId: z.string().min(1, "Select a project"),
        projectName: z.string().optional(),
        activityId: z.string().min(1, "Select an activity"),
        activityDescription: z.string().min(1),
        regularHours: z.coerce.number().min(0).max(24),
        overtimeHours: z.coerce.number().min(0).max(24),
        notes: z.string().optional(),
      })
    )
    .min(1, "Add at least one time entry"),
  generalNotes: z.string().optional(),
});

export type DailyLogFormValues = z.infer<typeof dailyLogFormSchema>;
