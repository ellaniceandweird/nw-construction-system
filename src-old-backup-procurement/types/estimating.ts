import type { BaseEntity } from "@/types/common";

/**
 * Estimating Module data models.
 * Source: SDS Volume 3 §9 — Estimate Header (§9.5), Cost Breakdown
 * Structure (§9.6), Quantity Takeoff (§9.7), Cost Database (§9.8), Cost
 * Codes (§9.9), Labor/Material/Equipment Databases (§9.10-9.12),
 * Assemblies (§9.13), Estimate Builder (§9.14), Subcontract Pricing
 * (§9.15), Contingency & Markup (§9.17).
 */

export type EstimateStatus =
  | "draft"
  | "internal_review"
  | "client_review"
  | "approved"
  | "rejected"
  | "superseded"
  | "archived";

export type MeasurementUnit =
  | "sf"
  | "lf"
  | "cy"
  | "pieces"
  | "each"
  | "hours"
  | "tons"
  | "gallons"
  | "pounds"
  | "meters"
  | "custom";

/** SDS §9.9 — Cost Code library, shared across every module. */
export interface CostCode extends BaseEntity {
  code: string; // e.g. "033000"
  description: string; // e.g. "Cast-In-Place Concrete"
  division: string; // e.g. "Division 03"
  trade?: string;
  category?: string;
  parentCostCode?: string;
}

/** SDS §9.7 — Quantity Takeoff item. */
export interface TakeoffItem {
  id: string;
  drawingReference?: string;
  revision?: string;
  location?: string;
  csiDivision?: string;
  costCode?: string;
  description: string;
  measurementType: MeasurementUnit;
  unit: string;
  quantity: number;
  wasteFactorPercent?: number;
  adjustedQuantity: number;
  measuredBy?: string;
  checkedBy?: string;
}

/** SDS §9.8 — Cost Database standardized pricing record. */
export interface CostDatabaseItem extends BaseEntity {
  costCode: string;
  description: string;
  category?: string;
  unit: string;
  laborCost: number;
  materialCost: number;
  equipmentCost: number;
  subcontractCost: number;
  overheadPercent?: number;
  profitPercent?: number;
  lastUpdated: string;
  supplier?: string;
  historicalAverage?: number;
}

/** SDS §9.10 — Labor Database. */
export interface LaborRate {
  trade: string;
  hourlyRate: number;
  burdenPercent?: number;
  overtimeMultiplier?: number;
  crewSize?: number;
  productionRate?: string; // e.g. "220 SF/day"
  standardHours?: number;
  unionStatus?: "union" | "non_union";
}

/** SDS §9.11 — Material Database (estimating pricing view). */
export interface MaterialPrice {
  materialId: string;
  unit: string;
  averageCost: number;
  supplier?: string;
  leadTimeDays?: number;
  freight?: number;
  tax?: number;
  wastePercent?: number;
  storageRequirements?: string;
  warranty?: string;
  specificationReference?: string;
  historicalCostTrend?: Array<{ date: string; cost: number }>;
}

/** SDS §9.12 — Equipment Database. */
export interface EquipmentRate {
  equipmentType: string;
  rentalRate?: number;
  ownershipRate?: number;
  fuelConsumption?: string;
  operatorRequired: boolean;
  maintenanceCost?: number;
  transportationCost?: number;
  availability?: string;
  productivityRate?: string;
}

/** SDS §9.13 — Assemblies (reusable construction systems). */
export interface Assembly extends BaseEntity {
  name: string;
  description?: string;
  costCodes: string[];
  components: Array<{
    description: string;
    quantity: number;
    unit: string;
    unitCost: number;
  }>;
}

/** SDS §9.15 — Subcontract Pricing (comparison of subcontractor quotes). */
export interface SubcontractPricingOption {
  vendorId: string;
  trade: string;
  scope: string;
  quotedPrice: number;
  inclusions?: string;
  exclusions?: string;
  insuranceStatus?: "current" | "expired" | "pending";
  proposalDate: string;
  validityDays?: number;
  recommendedAward: boolean;
  comparisonWithBudget?: number;
}

/** SDS §9.14 — Estimate Builder line item. */
export interface EstimateLineItem {
  costCode: string;
  description: string;
  quantity: number;
  unit: string;
  laborCost: number;
  materialCost: number;
  equipmentCost: number;
  subcontractCost: number;
  markupPercent?: number;
  tax?: number;
  totalCost: number;
  notes?: string;
}

/** SDS §9.5 — Estimate header + full estimate. */
export interface Estimate extends BaseEntity {
  projectId: string;
  estimateNumber: string;
  client?: string;
  address?: string;
  estimator: string;
  estimateDate: string;
  revision: number;
  estimateStatus: EstimateStatus;
  proposalNumber?: string;
  currency: string;
  taxMethod?: string;
  profitMarginPercent?: number;
  markupPercent?: number;
  notes?: string;

  lineItems: EstimateLineItem[];
  takeoffItems?: TakeoffItem[];
  subcontractOptions?: SubcontractPricingOption[];

  // SDS §9.16-9.17 — indirect costs & contingency
  indirectCosts?: {
    generalConditions?: number;
    temporaryFacilities?: number;
    permits?: number;
    insurance?: number;
    projectManagement?: number;
    mobilization?: number;
    demobilization?: number;
    utilities?: number;
    cleanup?: number;
    officeOverhead?: number;
  };
  contingency?: {
    designContingencyPercent?: number;
    constructionContingencyPercent?: number;
    escalationPercent?: number;
    profitPercent?: number;
    corporateOverheadPercent?: number;
    salesTaxPercent?: number;
    bondPercent?: number;
    insurancePercent?: number;
    retainagePercent?: number;
  };

  totalEstimatedCost: number;
}
