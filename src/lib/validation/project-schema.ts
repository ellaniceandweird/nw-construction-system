import { z } from "zod";

/**
 * Validation schema for the Project create/edit form.
 * Every field is optional — a project can be saved with only partial
 * details and filled in later as information becomes available.
 */
export const projectFormSchema = z.object({
  projectName: z.string().optional(),
  propertyId: z.string().optional(),
  billingEntityId: z.string().optional(),

  projectDescription: z.string().optional(),
  manualStatus: z.enum(["planning", "active", "on_hold", "closed", "archived"]).optional(),

  startDate: z.string().optional(),
  plannedCompletionDate: z.string().optional(),

  approvedBudget: z.coerce.number().optional(),

  /** Kept as a string in the form (not coerced) — an empty string must mean "leave untouched," not accidentally coerce to 0 and zero out a project's completion. Parsed carefully at submit time instead. */
  manualCompletionPercent: z.string().optional(),

  notes: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
