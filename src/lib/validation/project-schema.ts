import { z } from "zod";

/**
 * Validation schema for the Project create/edit form.
 * Mirrors the core fields of the Project type (types/project.ts) that a
 * human actually fills in by hand — system-managed fields (id, healthScore,
 * completionPercent, audit metadata) are computed elsewhere, not entered.
 */
export const projectFormSchema = z.object({
  projectName: z.string().min(3, "Project name must be at least 3 characters"),
  propertyName: z.string().optional(),
  clientName: z.string().min(2, "Client name is required"),

  street: z.string().min(2, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().length(2, "Use a 2-letter state code (e.g. NY)"),
  zip: z.string().regex(/^\d{5}$/, "ZIP must be 5 digits"),

  projectType: z.string().min(2, "Project type is required"),
  contractType: z.string().min(2, "Contract type is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]),

  startDate: z.string().min(1, "Start date is required"),
  plannedCompletionDate: z.string().min(1, "Target completion date is required"),

  estimatedContractValue: z.coerce
    .number()
    .min(0, "Contract value can't be negative"),
  approvedBudget: z.coerce.number().min(0, "Budget can't be negative"),

  tags: z.array(z.string()),
  notes: z.string().optional(),
}).refine((data) => data.plannedCompletionDate >= data.startDate, {
  message: "Target completion date must be on or after the start date",
  path: ["plannedCompletionDate"],
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
