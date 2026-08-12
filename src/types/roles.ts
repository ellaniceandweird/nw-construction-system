/**
 * Role-Based Access Control — role definitions.
 * Source: SDS Volume 1 §11 (User Roles) and Volume 3 §13.5 (Role Management).
 *
 * This file defines the canonical role identifiers used across the app.
 * Full permission matrices (module/record/field level) are implemented in
 * Phase 9 (lib/rbac). Navigation filtering uses this list starting Phase 2.
 */

export const ROLES = [
  "system_administrator",
  "executive",
  "director_of_construction",
  "chief_financial_officer",
  "senior_office_manager",
  "operations_manager",
  "project_manager",
  "project_engineer",
  "superintendent",
  "procurement_officer",
  "estimator",
  "accounting",
  "safety_officer",
  "quality_inspector",
  "field_supervisor",
  "crew_leader",
  "read_only",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  system_administrator: "System Administrator",
  executive: "Executive",
  director_of_construction: "Director of Construction",
  chief_financial_officer: "Chief Financial Officer",
  senior_office_manager: "Senior Office Manager",
  operations_manager: "Operations Manager",
  project_manager: "Project Manager",
  project_engineer: "Project Engineer",
  superintendent: "Superintendent",
  procurement_officer: "Procurement Officer",
  estimator: "Estimator",
  accounting: "Accounting",
  safety_officer: "Safety Officer",
  quality_inspector: "Quality Inspector",
  field_supervisor: "Field Supervisor",
  crew_leader: "Crew Leader",
  read_only: "Read-Only User",
};
