import { z } from "zod";

/**
 * Validation schema for the Project create/edit form.
 * Mirrors the core fields of the Project type (types/project.ts) that a
 * human actually fills in by hand — system-managed fields (id, healthScore,
 * completionPercent, audit metadata) are computed elsewhere, not entered.
 */
export const projectFormSchema = z.object({
  projectName: z.string().min(3, "Project name must be at least 3 characters"),
  propertyId: z.string().min(1, "Select a property"),
  billingEntityId: z.string().min(1, "Select a property to determine the billing entity"),

  projectDescription: z.string().optional(),
  manualStatus: z.enum(["active", "on_hold", "closed", "archived"]),

  startDate: z.string().min(1, "Start date is required"),
  plannedCompletionDate: z.string().min(1, "Target completion date is required"),

  approvedBudget: z.coerce.number().min(0, "Budget can't be negative"),

  tags: z.array(z.string()),
  notes: z.string().optional(),
}).refine((data) => data.plannedCompletionDate >= data.startDate, {
  message: "Target completion date must be on or after the start date",
  path: ["plannedCompletionDate"],
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
