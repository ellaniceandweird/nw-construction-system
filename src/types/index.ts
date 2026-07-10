/**
 * Barrel export — lets feature code do:
 *   import type { Project, Activity, PurchaseOrder } from "@/types";
 * instead of importing from each module file individually.
 */
export * from "@/types/common";
export * from "@/types/roles";
export * from "@/types/project";
export * from "@/types/scheduling";
export * from "@/types/field-operations";
export * from "@/types/procurement";
export * from "@/types/estimating";
export * from "@/types/financial";
export * from "@/types/documents";
export * from "@/types/maintenance";
