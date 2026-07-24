import { z } from "zod";

export const activityFormSchema = z
  .object({
    projectId: z.string().min(1, "Select a project"),
    name: z.string().min(3, "Activity name must be at least 3 characters"),
    plannedStart: z.string().min(1, "Start date is required"),
    plannedFinish: z.string().min(1, "Finish date is required"),
    actualStart: z.string().optional(),
    actualFinish: z.string().optional(),
    requiredManpower: z.coerce.number().min(0).optional(),
    status: z.enum([
      "not_started",
      "ready",
      "in_progress",
      "delayed",
      "blocked",
      "completed",
      "cancelled",
    ]),
    isCritical: z.boolean(),
  })
  .refine((data) => data.plannedFinish >= data.plannedStart, {
    message: "Finish date must be on or after the start date",
    path: ["plannedFinish"],
  });

export type ActivityFormValues = z.infer<typeof activityFormSchema>;
