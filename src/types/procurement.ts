import type { BaseEntity, Priority } from "@/types/common";

/**
 * Procurement Module data models.
 * Source: SDS Volume 3 §8 — Vendors (§8.5), Material Database (§8.6),
 * Material Requests (§8.7), RFQs (§8.9), Quote Comparison (§8.10),
 * Purchase Orders (§8.11), Delivery Tracking (§8.12), Inventory (§8.14),
 * Subcontract Procurement (§8.16).
 */

export interface VendorPerformance {
  totalPurchaseOrders: number;
  onTimeDeliveryPercent: number;
  averageDeliveryDays: number;
  qualityRating: number; // 0-100
  priceRating: number; // 0-100
  communicationRating: number; // 0-100
  overallVendorScore: number; // 0-100
}

/** SDS §8.5 — Vendor Management. */
export interface Vendor extends BaseEntity {
  vendorName: string;
  legalName?: string;
  vendorCategory: string;
  trade?: string;
  supplierType?: "material" | "subcontractor" | "equipment_rental" | "service";

  primaryContact?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;

  paymentTerms?: string;
  leadTimeDays?: number;
  taxId?: string;
  creditAccount?: string;
  insuranceExpiration?: string;
  licenseExpiration?: string;
  bondInformation?: string;
  isPreferredVendor: boolean;
  isApprovedVendor: boolean;
  minorityOwnedStatus?: string;
  notes?: string;

  performance: VendorPerformance;
}

/** SDS §8.6 — Material Database. */
export interface MaterialCatalogItem extends BaseEntity {
  description: string;
  category: string;
  subcategory?: string;
  manufacturer?: string;
  model?: string;
  finish?: string;
  color?: string;
  size?: string;
  unit: string;
  preferredVendorId?: string;
  secondaryVendorId?: string;
  leadTimeDays?: number;
  averageCost: number;
  minimumStock?: number;
  maximumStock?: number;
  reorderLevel?: number;
  storageLocation?: string;
  costCode?: string;
  csiDivision?: string;
  specificationReference?: string;
}

export type MaterialRequestStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "rfq_issued"
  | "po_issued"
  | "closed";

export interface MaterialRequestLineItem {
  materialId?: string;
  description: string;
  quantity: number;
  unit: string;
  preferredVendorId?: string;
  costCode?: string;
  remarks?: string;
}

/** SDS §8.7 — Material Request (MR). */
export interface MaterialRequest extends BaseEntity {
  projectId: string;
  mrNumber: string;
  activityId?: string;
  requestedBy: string;
  department?: string;
  priority: Priority;
  requestDate: string;
  requiredOnSiteDate: string;
  approvalStatus: "pending" | "approved" | "rejected";
  estimatedCost?: number;
  notes?: string;
  /** Link to an attached file, Google Doc, or PDF supporting this request. */
  referenceUrl?: string;
  requestStatus: MaterialRequestStatus;
  lineItems: MaterialRequestLineItem[];
}

export type QuoteApprovalStatus = "pending_approval" | "rejected";

export interface VendorQuoteResponse {
  vendorId: string;
  quotedPrice: number;
  leadTimeDays: number;
  freight?: number;
  tax?: number;
  warranty?: string;
  notes?: string;
  validityPeriodDays?: number;
  /** ISO date the vendor's quote was received. */
  submittedDate?: string;
  /** Computed overall score for Quote Comparison (SDS §8.10). */
  overallScore?: number;
  /**
   * Manual status set on the Quotes tab. "Awarded" isn't stored here —
   * it's derived from the parent RFQ's awardedVendorId so there's one
   * source of truth for who won.
   */
  quoteStatus?: QuoteApprovalStatus;
}

export type RFQStatus = "open" | "partial" | "quoted" | "awarded";

/** SDS §8.9 — Request for Quotation (RFQ). */
export interface RequestForQuotation extends BaseEntity {
  projectId: string;
  rfqNumber: string;
  materialRequestId?: string;
  vendorIds: string[];
  issueDate: string;
  dueDate: string;
  scope?: string;
  materialList: string;
  notes?: string;
  responses: VendorQuoteResponse[];
  /** Reference files (spec sheets, photos) linked from Drive to include with the vendor invite email. */
  attachments?: { name: string; url: string }[];
  /** Set once a vendor is selected via Quote Comparison (SDS §8.10). */
  awardedVendorId?: string;
  /**
   * Manual override for cases the automatic open/partial/quoted/awarded
   * pipeline status can't express — e.g. the RFQ was scrapped or closed
   * without awarding anyone. Takes precedence over the derived status
   * when set. Editable from the RFQ edit dialog.
   */
  manualStatus?: "cancelled" | "closed";
}

export type PurchaseOrderStatus =
  | "approved"
  | "paid"
  | "partially_delivered"
  | "delivered"
  | "cancelled";

export interface PurchaseOrderLineItem {
  materialId?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  extendedPrice: number;
  requiredDate?: string;
  costCode?: string;
  activityId?: string;
}

/** SDS §8.11 — Purchase Orders. */
export interface PurchaseOrder extends BaseEntity {
  projectId: string;
  poNumber: string;
  vendorId: string;
  billingEntityId: string;
  shippingAddress?: string;
  orderDate: string;
  expectedDelivery?: string;
  buyer?: string;
  poStatus: PurchaseOrderStatus;
  terms?: string;
  currency: string;
  tax?: number;
  freight?: number;
  total: number;
  notes?: string;
  lineItems: PurchaseOrderLineItem[];
  /** Set when this PO was auto-generated from an awarded quote, rather than entered by hand. */
  sourceRfqId?: string;
}

export type DeliveryTrackingStatus =
  | "pending"
  | "in_transit"
  | "arrived"
  | "partially_received"
  | "rejected"
  | "damaged"
  | "complete";

/** SDS §8.12 — Delivery Tracking. */
export interface Delivery extends BaseEntity {
  projectId: string;
  deliveryNumber: string;
  purchaseOrderId: string;
  vendorId: string;
  carrier?: string;
  trackingNumber?: string;
  expectedDate: string;
  actualDate?: string;
  arrivalTime?: string;
  receivedBy?: string;
  inspectionStatus?: string;
  damageStatus?: "none" | "minor" | "major";
  shortageStatus?: "none" | "partial_shortage";
  acceptanceStatus?: "accepted" | "rejected" | "pending";
  photoIds?: string[];
  deliveryStatus: DeliveryTrackingStatus;
}

/** SDS §8.14 — Inventory Management. */
export interface InventoryRecord {
  materialId: string;
  projectId: string;
  location?: string;
  quantityReceived: number;
  quantityIssued: number;
  quantityRemaining: number;
  reservedQuantity: number;
  availableQuantity: number;
  unit: string;
  lastUpdated: string;
}

/** SDS §8.16 — Subcontract Procurement. */
export interface Subcontract extends BaseEntity {
  projectId: string;
  subcontractNumber: string;
  vendorId: string;
  trade: string;
  scopeOfWork: string;
  contractValue: number;
  retentionPercent?: number;
  insuranceStatus?: "current" | "expired" | "pending";
  startDate?: string;
  completionDate?: string;
  progressPercent: number;
  invoiceIds?: string[];
  changeOrderIds?: string[];
  performanceRating?: number;
}
