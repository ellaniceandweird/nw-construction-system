import type { BaseEntity } from "@/types/common";

/**
 * Contacts Module — a directory for everyone Nice & Weird deals with who
 * ISN'T a trade vendor or subcontractor (those already have a full home
 * in Procurement, with quotes/POs/RFQs tied to them — duplicating that
 * here would just split the same data across two places). This covers
 * design professionals, government/regulatory contacts, service
 * providers, and internal team members.
 */
export type ContactCategory =
  | "design_professional"
  | "government_regulatory"
  | "service_provider"
  | "internal_team"
  | "other";

export interface Contact extends BaseEntity {
  name: string;
  company?: string;
  category: ContactCategory;
  role?: string; // e.g. "Architect", "Building Inspector", "Bookkeeper"
  email?: string;
  phone?: string;
  address?: string;
  relatedPropertyId?: string;
  notes?: string;
}
