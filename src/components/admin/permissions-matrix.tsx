"use client";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { ROLES, ROLE_LABELS } from "@/types/roles";
import type { Role } from "@/types/roles";

const MODULES = [
  "Projects",
  "Estimating & Budgeting",
  "Financial Tracking",
  "Procurement",
  "Maintenance",
  "Documents",
  "References",
  "Settings",
] as const;

/**
 * Full access for admins/executives/ops; field-facing roles get the
 * modules relevant to their day-to-day; read_only gets view access
 * everywhere (view-only isn't enforced per-module yet, this is the
 * intended shape).
 */
const FULL_ACCESS_ROLES: Role[] = ["system_administrator", "executive", "operations_manager"];
const MODULE_ACCESS: Record<(typeof MODULES)[number], Role[]> = {
  Projects: [...FULL_ACCESS_ROLES, "director_of_construction", "project_manager", "project_engineer", "superintendent", "field_supervisor"],
  "Estimating & Budgeting": [...FULL_ACCESS_ROLES, "director_of_construction", "chief_financial_officer", "estimator", "project_manager"],
  "Financial Tracking": [...FULL_ACCESS_ROLES, "chief_financial_officer", "accounting", "estimator"],
  Procurement: [...FULL_ACCESS_ROLES, "director_of_construction", "procurement_officer", "project_manager"],
  Maintenance: [...FULL_ACCESS_ROLES, "director_of_construction", "field_supervisor", "crew_leader", "superintendent"],
  Documents: [...FULL_ACCESS_ROLES, "senior_office_manager", "project_manager", "project_engineer", "quality_inspector", "safety_officer"],
  References: [...FULL_ACCESS_ROLES, "senior_office_manager", "chief_financial_officer", "accounting"],
  Settings: ["system_administrator", "senior_office_manager"],
};

export function PermissionsMatrix() {
  return (
    <>
      <p className="mb-3 text-xs text-muted-foreground">
        A reference for what each role is intended to access. This isn&apos;t
        enforced page-by-page yet — think of it as the plan we&apos;re building
        toward as more people join, not an active restriction today.
      </p>
      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="sticky left-0 bg-card px-4 py-3 font-medium">Role</th>
              {MODULES.map((m) => (
                <th key={m} className="whitespace-nowrap px-3 py-3 text-center font-medium">{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROLES.map((role) => (
              <tr key={role} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="sticky left-0 bg-card px-4 py-2.5 font-medium text-foreground">{ROLE_LABELS[role]}</td>
                {MODULES.map((m) => (
                  <td key={m} className="px-3 py-2.5 text-center">
                    {MODULE_ACCESS[m].includes(role) && <Check className="mx-auto size-3.5 text-success" />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
