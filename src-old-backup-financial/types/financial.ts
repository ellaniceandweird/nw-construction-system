import type { BaseEntity } from "@/types/common";

/**
 * Financial Tracking Module data models.
 * Source: SDS Volume 3 §10 — Budget (§10.5), Cost Tracking (§10.6), Labor/
 * Material/Equipment/Subcontract Cost Management (§10.7-10.10), Change
 * Orders (§10.11), Invoices (§10.12), Billing Entities (§10.13), Cash Flow
 * Forecasting (§10.14), Earned Value Management (§10.15).
 */

export type BudgetStatus = "draft" | "pending_approval" | "approved" | "revised";

/** SDS §10.5 — Budget Management. */
export interface Budget extends BaseEntity {
  projectId: string;
  revision: number;
  preparedBy: string;
  approvedBy?: string;
  approvalDate?: string;
  budgetStatus: BudgetStatus;
  originalBudget: number;
  currentBudget: number;
  forecastBudget: number;
  remainingBudget: number;

  categories: {
    labor: number;
    materials: number;
    equipment: number;
    subcontracts: number;
    generalConditions: number;
    permits: number;
    insurance: number;
    temporaryFacilities: number;
    overhead: number;
    contingency: number;
    profit: number;
  };
}

/** SDS §10.6 — Cost Tracking (actual cost transaction ledger). */
export interface CostTransaction extends BaseEntity {
  projectId: string;
  activityId?: string;
  costCode: string;
  category:
    | "labor"
    | "material"
    | "equipment"
    | "subcontract"
    | "miscellaneous";
  description: string;
  vendorId?: string;
  date: string;
  amount: number;
  billingEntityId?: string;
  referenceNumber?: string;
  sourceModule:
    | "field_operations"
    | "procurement"
    | "estimating"
    | "manual";
}

/** SDS §10.7 — Labor Cost Management. */
export interface LaborCostRecord {
  employeeId: string;
  trade: string;
  crew?: string;
  projectId: string;
  activityId?: string;
  regularHours: number;
  overtimeHours: number;
  doubleTimeHours?: number;
  hourlyRate: number;
  laborBurdenPercent?: number;
  payrollPeriod: string;
  billingEntityId?: string;
  costCode?: string;
  totalLaborCost: number;
}

/** SDS §10.8 — Material Cost Management. */
export interface MaterialCostRecord {
  purchaseOrderId: string;
  vendorId: string;
  material: string;
  quantityOrdered: number;
  quantityDelivered: number;
  quantityInstalled: number;
  unitCost: number;
  freight?: number;
  tax?: number;
  waste?: number;
  actualCost: number;
  remainingInventoryValue?: number;
}

/** SDS §10.9 — Equipment Cost Management. */
export interface EquipmentCostRecord {
  equipmentId: string;
  projectId: string;
  activityId?: string;
  operator?: string;
  hoursUsed: number;
  rentalRate?: number;
  ownershipCost?: number;
  fuelCost?: number;
  maintenanceCost?: number;
  transportationCost?: number;
  idleCost?: number;
  totalEquipmentCost: number;
}

/** SDS §10.10 — Subcontract Cost Management (financial view of a Subcontract). */
export interface SubcontractCostRecord {
  subcontractId: string;
  vendorId: string;
  trade: string;
  originalContract: number;
  approvedChangeOrders: number;
  currentContract: number;
  invoicesReceived: number;
  invoicesApproved: number;
  retentionHeld: number;
  balanceRemaining: number;
  completionPercent: number;
  paymentStatus: "current" | "overdue" | "disputed";
}

export type ChangeOrderStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "implemented"
  | "closed";

export type ChangeOrderType =
  | "owner"
  | "internal"
  | "subcontract"
  | "field_directive"
  | "potential";

/** SDS §10.11 — Change Order Management. */
export interface ChangeOrder extends BaseEntity {
  projectId: string;
  changeOrderNumber: string;
  type: ChangeOrderType;
  reason: string;
  description: string;
  initiator: string;
  costImpact: number;
  scheduleImpactDays?: number;
  changeOrderStatus: ChangeOrderStatus;
  /**
   * Optional bridge to a specific Estimate (Estimating module) so its
   * revised budget on Cost Tracking includes this change order. Left
   * unset, the change order still applies at the project level.
   */
  estimateId?: string;
  costCode?: string;
  requestedDate?: string;
  approvedDate?: string;
  approvedBy?: string;
  notes?: string;
}

export type InvoiceStatus =
  | "draft"
  | "pending_approval"
  | "issued"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled";

export interface InvoiceLineItem {
  activityId?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  tax?: number;
  retentionPercent?: number;
  total: number;
}

/** SDS §10.12 — Invoice Management. */
export interface Invoice extends BaseEntity {
  projectId: string;
  invoiceNumber: string;
  billingEntityId: string;
  client: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms?: string;
  preparedBy: string;
  invoiceStatus: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  totalAmount: number;
}

/** SDS §10.13 — Billing Entity Management. */
export interface BillingEntity extends BaseEntity {
  companyName: string;
  legalName?: string;
  taxId?: string;
  address?: string;
  bankDetails?: string;
  invoicePrefix?: string;
  defaultPaymentTerms?: string;
  logoUrl?: string;
  contactInformation?: string;
}

/** SDS §10.15 — Earned Value Management metrics, computed per project. */
export interface EarnedValueMetrics {
  projectId: string;
  asOfDate: string;
  plannedValue: number; // PV
  earnedValue: number; // EV
  actualCost: number; // AC
  costVariance: number; // CV = EV - AC
  scheduleVariance: number; // SV = EV - PV
  costPerformanceIndex: number; // CPI = EV / AC
  schedulePerformanceIndex: number; // SPI = EV / PV
  estimateAtCompletion: number; // EAC
  estimateToComplete: number; // ETC
  varianceAtCompletion: number; // VAC
}
