import type { BaseEntity, Attachment } from "@/types/common";

/**
 * Project Management Module data models.
 * Source: SDS Volume 3 §5 (Project Management Module), esp. §5.3 (Project
 * Record Structure), §5.4 (Lifecycle), §5.9 (Health Score), §5.10
 * (Milestones), §5.11 (Team), §5.14 (Tags).
 */

export type ProjectLifecyclePhase =
  | "opportunity"
  | "preconstruction"
  | "estimating"
  | "design_coordination"
  | "procurement"
  | "construction"
  | "commissioning"
  | "punch_list"
  | "substantial_completion"
  | "closeout"
  | "warranty"
  | "archived";

/** SDS §5.8 — calculated (not manually set) operational status. */
export type ProjectCalculatedStatus =
  | "planning"
  | "active"
  | "on_hold"
  | "delayed"
  | "substantially_complete"
  | "closed"
  | "archived";

export type ProjectPriority = "low" | "medium" | "high" | "urgent";

export type ProjectTag =
  | "residential"
  | "commercial"
  | "roofing"
  | "exterior_renovation"
  | "historic_restoration"
  | "emergency_work"
  | "high_priority"
  | "warranty"
  | "internal"
  | "capital_project";

/** SDS §5.3 — the master project record. Parent entity for all other modules. */
export interface Project extends BaseEntity {
  // Identification
  projectNumber: string;
  projectName: string;
  propertyName?: string;
  billingEntityId: string;
  costCenter?: string;
  internalProjectCode?: string;

  // Location
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    gpsLat?: number; // future
    gpsLng?: number; // future
  };

  // Client information
  clientName: string;
  owner?: string;
  architect?: string;
  engineer?: string;
  generalContractor?: string;
  primaryContact?: string;
  contactEmail?: string;
  contactPhone?: string;

  // Project information
  projectType: string;
  constructionCategory: string;
  contractType: string;
  currentPhase: ProjectLifecyclePhase;
  manualStatus: "active" | "on_hold" | "closed" | "archived"; // user-set
  calculatedStatus: ProjectCalculatedStatus; // system-derived, SDS §5.8
  priority: ProjectPriority;
  startDate: string;
  plannedCompletionDate: string;
  actualCompletionDate?: string;
  estimatedContractValue: number;
  approvedBudget: number;
  /** Real "Cost to Date" figure from the source workbook, where available. */
  actualCostToDate?: number;

  // Project team (key roles; full assignment list lives in TeamAssignment[])
  team: {
    director?: string;
    operationsManager?: string;
    projectManager?: string;
    projectEngineer?: string;
    superintendent?: string;
    foreman?: string;
    procurementLead?: string;
    estimator?: string;
  };

  tags: ProjectTag[];

  /** 0-100, SDS §5.9 — weighted schedule/budget/RFI/safety/productivity/AI score. */
  healthScore: number;

  /** 0-100 completion, weighted by activity duration/cost/weight (SDS §6.12). */
  completionPercent: number;

  attachments?: Attachment[];
}

/** SDS §5.10 — Milestone Management. */
export interface Milestone extends BaseEntity {
  projectId: string;
  name: string;
  description?: string;
  plannedDate: string;
  forecastDate?: string;
  actualDate?: string;
  responsiblePerson?: string;
  dependencyIds?: string[];
  completionPercent: number;
  notes?: string;
}

/** SDS §5.11 — Project Team Management. */
export interface TeamAssignment extends BaseEntity {
  projectId: string;
  employeeId: string;
  employeeName: string;
  role: string;
  department?: string;
  email?: string;
  phone?: string;
  assignmentStartDate: string;
  assignmentEndDate?: string;
  availability?: "full_time" | "part_time" | "as_needed";
  isActive: boolean;
}

/** Weighting factors behind the Project Health Score (admin-configurable, SDS §5.9). */
export interface HealthScoreWeights {
  schedulePerformance: number;
  budgetPerformance: number;
  procurementStatus: number;
  openRfis: number;
  outstandingSubmittals: number;
  safetyIncidents: number;
  crewProductivity: number;
  aiRiskAssessment: number;
}
