import { z } from "zod";

/**
 * Validation schema for the Project create/edit form.
 * Every field is optional — a project can be saved with only partial
 * details and filled in later as information becomes available.
 */
export const projectFormSchema = z.object({
  // Identification
  projectNumber: z.string().optional(),
  projectName: z.string().optional(),
  propertyId: z.string().optional(),
  billingEntityId: z.string().optional(),
  costCenter: z.string().optional(),
  internalProjectCode: z.string().optional(),

  // Client information
  clientName: z.string().optional(),
  owner: z.string().optional(),
  architect: z.string().optional(),
  engineer: z.string().optional(),
  generalContractor: z.string().optional(),
  primaryContact: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),

  // Project information
  projectDescription: z.string().optional(),
  constructionCategory: z.string().optional(),
  contractType: z.string().optional(),
  currentPhase: z.enum([
    "opportunity", "preconstruction", "estimating", "design_coordination", "procurement",
    "construction", "commissioning", "punch_list", "substantial_completion", "closeout", "warranty", "archived",
  ]).optional(),
  manualStatus: z.enum(["planning", "active", "on_hold", "closed", "archived"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),

  startDate: z.string().optional(),
  plannedCompletionDate: z.string().optional(),
  actualCompletionDate: z.string().optional(),

  estimatedContractValue: z.coerce.number().optional(),
  approvedBudget: z.coerce.number().optional(),

  // Project team
  director: z.string().optional(),
  operationsManager: z.string().optional(),
  projectManager: z.string().optional(),
  projectEngineer: z.string().optional(),
  superintendent: z.string().optional(),
  foreman: z.string().optional(),
  procurementLead: z.string().optional(),
  estimator: z.string().optional(),

  /** Kept as a string in the form (not coerced) — an empty string must mean "leave untouched," not accidentally coerce to 0 and zero out a project's completion. Parsed carefully at submit time instead. */
  manualCompletionPercent: z.string().optional(),

  notes: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
