import type { BaseEntity } from "@/types/common";

/** A subcontractor sourcing request — separate from Material Request (materials) and RFQs (vendor quotes) since this tracks scoping/budgeting subcontractor work before it's ready to go out for formal quotes. */
export interface SubcontractorSourcingRequest extends BaseEntity {
  projectId?: string;
  propertyId?: string;
  propertyName?: string;
  trade: string;
  scopeOfWork: string;
  budget?: number;
  notes?: string;
}
