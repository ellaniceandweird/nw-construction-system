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

  notes: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
