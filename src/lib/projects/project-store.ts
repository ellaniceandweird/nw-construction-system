"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import type { Project } from "@/types/project";

function fromRow(row: Record<string, any>): Project {
  return {
    id: row.id,
    projectNumber: row.project_number,
    projectName: row.project_name,
    propertyName: row.property_name ?? undefined,
    billingEntityId: row.billing_entity_id,
    costCenter: row.cost_center ?? undefined,
    internalProjectCode: row.internal_project_code ?? undefined,
    address: row.address ?? { street: "", city: "", state: "", zip: "", country: "USA" },
    clientName: row.client_name,
    owner: row.owner ?? undefined,
    architect: row.architect ?? undefined,
    engineer: row.engineer ?? undefined,
    generalContractor: row.general_contractor ?? undefined,
    primaryContact: row.primary_contact ?? undefined,
    contactEmail: row.contact_email ?? undefined,
    contactPhone: row.contact_phone ?? undefined,
    projectType: row.project_type,
    constructionCategory: row.construction_category,
    contractType: row.contract_type,
    currentPhase: row.current_phase,
    manualStatus: row.manual_status,
    calculatedStatus: row.calculated_status,
    priority: row.priority,
    startDate: row.start_date,
    plannedCompletionDate: row.planned_completion_date,
    actualCompletionDate: row.actual_completion_date ?? undefined,
    estimatedContractValue: Number(row.estimated_contract_value ?? 0),
    approvedBudget: Number(row.approved_budget ?? 0),
    actualCostToDate: row.actual_cost_to_date != null ? Number(row.actual_cost_to_date) : undefined,
    team: row.team ?? {},
    tags: row.tags ?? [],
    healthScore: Number(row.health_score ?? 100),
    completionPercent: Number(row.completion_percent ?? 0),
    notes: row.notes ?? undefined,
    createdBy: row.created_by ?? "system",
    createdDate: row.created_date ?? new Date().toISOString(),
    lastModifiedBy: row.last_modified_by ?? "system",
    lastModifiedDate: row.last_modified_date ?? new Date().toISOString(),
    revisionNumber: row.revision_number ?? 1,
    module: "Project Management",
    status: row.status ?? "active",
  };
}

function toRow(input: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  if (input.id !== undefined) row.id = input.id;
  if (input.projectNumber !== undefined) row.project_number = input.projectNumber;
  if (input.projectName !== undefined) row.project_name = input.projectName;
  if (input.propertyName !== undefined) row.property_name = input.propertyName;
  if (input.billingEntityId !== undefined) row.billing_entity_id = input.billingEntityId;
  if (input.costCenter !== undefined) row.cost_center = input.costCenter;
  if (input.internalProjectCode !== undefined) row.internal_project_code = input.internalProjectCode;
  if (input.address !== undefined) row.address = input.address;
  if (input.clientName !== undefined) row.client_name = input.clientName;
  if (input.owner !== undefined) row.owner = input.owner;
  if (input.architect !== undefined) row.architect = input.architect;
  if (input.engineer !== undefined) row.engineer = input.engineer;
  if (input.generalContractor !== undefined) row.general_contractor = input.generalContractor;
  if (input.primaryContact !== undefined) row.primary_contact = input.primaryContact;
  if (input.contactEmail !== undefined) row.contact_email = input.contactEmail;
  if (input.contactPhone !== undefined) row.contact_phone = input.contactPhone;
  if (input.projectType !== undefined) row.project_type = input.projectType;
  if (input.constructionCategory !== undefined) row.construction_category = input.constructionCategory;
  if (input.contractType !== undefined) row.contract_type = input.contractType;
  if (input.currentPhase !== undefined) row.current_phase = input.currentPhase;
  if (input.manualStatus !== undefined) row.manual_status = input.manualStatus;
  if (input.calculatedStatus !== undefined) row.calculated_status = input.calculatedStatus;
  if (input.priority !== undefined) row.priority = input.priority;
  if (input.startDate !== undefined) row.start_date = input.startDate;
  if (input.plannedCompletionDate !== undefined) row.planned_completion_date = input.plannedCompletionDate;
  if (input.actualCompletionDate !== undefined) row.actual_completion_date = input.actualCompletionDate;
  if (input.estimatedContractValue !== undefined) row.estimated_contract_value = input.estimatedContractValue;
  if (input.approvedBudget !== undefined) row.approved_budget = input.approvedBudget;
  if (input.actualCostToDate !== undefined) row.actual_cost_to_date = input.actualCostToDate;
  if (input.team !== undefined) row.team = input.team;
  if (input.tags !== undefined) row.tags = input.tags;
  if (input.healthScore !== undefined) row.health_score = input.healthScore;
  if (input.completionPercent !== undefined) row.completion_percent = input.completionPercent;
  if (input.notes !== undefined) row.notes = input.notes;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<Project>({
  table: "projects",
  seedData: MOCK_PROJECTS,
  fromRow,
  toRow,
  orderBy: "project_name",
});

export const subscribeProjects = store.subscribe;
export const getProjectsSnapshot = store.getSnapshot;

export interface ProjectInput {
  projectNumber: string;
  projectName: string;
  propertyName?: string;
  billingEntityId: string;
  address: Project["address"];
  clientName: string;
  owner?: string;
  architect?: string;
  engineer?: string;
  generalContractor?: string;
  primaryContact?: string;
  contactEmail?: string;
  contactPhone?: string;
  projectType: string;
  constructionCategory: string;
  contractType: string;
  currentPhase: Project["currentPhase"];
  manualStatus: Project["manualStatus"];
  calculatedStatus?: Project["calculatedStatus"];
  priority: Project["priority"];
  startDate: string;
  plannedCompletionDate: string;
  estimatedContractValue: number;
  approvedBudget: number;
  team?: Project["team"];
  tags: Project["tags"];
  notes?: string;
}

function nextId(): string {
  const items = store.getSnapshot();
  const maxNum = items.reduce((max, p) => {
    const n = parseInt(p.id.replace("PRJ-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `PRJ-${String(maxNum + 1).padStart(6, "0")}`;
}

export function createProject(input: ProjectInput) {
  const id = nextId();
  void store.create({
    id,
    calculatedStatus: input.manualStatus,
    team: input.team ?? {},
    healthScore: 100,
    completionPercent: 0,
    ...input,
  });
  return id;
}

export function updateProject(id: string, input: Partial<ProjectInput>) {
  void store.update(id, input);
}
