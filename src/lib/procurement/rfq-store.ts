"use client";

import { MOCK_RFQS } from "@/lib/data/mock/rfqs";
import { scoreResponses } from "@/lib/procurement/quote-scoring";
import type { RequestForQuotation, VendorQuoteResponse } from "@/types/procurement";

const STORAGE_KEY = "project-nw:rfqs";

type Listener = () => void;

let rfqs: RequestForQuotation[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): RequestForQuotation[] {
  if (typeof window === "undefined") return MOCK_RFQS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return MOCK_RFQS;
    return JSON.parse(raw) as RequestForQuotation[];
  } catch {
    return MOCK_RFQS;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rfqs));
}

function emit() {
  listeners.forEach((l) => l());
}

function nextRfqNumber(): string {
  const year = new Date().getFullYear();
  const seq = rfqs.length + 1;
  return `RFQ-${year}-${String(seq).padStart(4, "0")}`;
}

function nextId(): string {
  const maxNum = rfqs.reduce((max, r) => {
    const n = parseInt(r.id.replace("RFQ-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `RFQ-${String(maxNum + 1).padStart(6, "0")}`;
}

export function subscribeRFQs(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getRFQsSnapshot(): RequestForQuotation[] {
  return rfqs;
}

export interface CreateRFQInput {
  projectId: string;
  materialRequestId?: string;
  vendorIds: string[];
  issueDate: string;
  dueDate: string;
  scope?: string;
  materialList: string;
  notes?: string;
  attachments?: { name: string; url: string }[];
}

export function createRFQ(input: CreateRFQInput) {
  const now = new Date().toISOString();
  const newRfq: RequestForQuotation = {
    id: nextId(),
    createdBy: "user",
    createdDate: now,
    lastModifiedBy: "user",
    lastModifiedDate: now,
    revisionNumber: 1,
    module: "Procurement",
    status: "active",
    rfqNumber: nextRfqNumber(),
    responses: [],
    ...input,
  };
  rfqs = [...rfqs, newRfq];
  persist();
  emit();
  return newRfq;
}

export interface RFQEditInput {
  projectId?: string;
  materialRequestId?: string;
  vendorIds?: string[];
  issueDate?: string;
  dueDate?: string;
  scope?: string;
  materialList?: string;
  notes?: string;
  manualStatus?: "cancelled" | "closed";
}

export function updateRFQ(id: string, input: RFQEditInput) {
  rfqs = rfqs.map((r) => {
    if (r.id !== id) return r;
    const next = { ...r, ...input, lastModifiedDate: new Date().toISOString() };
    // If the invited-vendor list shrank, drop responses/award for vendors no longer invited.
    if (input.vendorIds) {
      next.responses = scoreResponses(
        next.responses.filter((resp) => input.vendorIds!.includes(resp.vendorId))
      );
      if (next.awardedVendorId && !input.vendorIds.includes(next.awardedVendorId)) {
        next.awardedVendorId = undefined;
      }
    }
    return next;
  });
  persist();
  emit();
}

export type QuoteResponseInput = Omit<VendorQuoteResponse, "overallScore">;

/** Adds a new vendor quote response, or updates it if that vendor already responded. */
export function upsertQuoteResponse(rfqId: string, input: QuoteResponseInput) {
  rfqs = rfqs.map((r) => {
    if (r.id !== rfqId) return r;
    const withoutVendor = r.responses.filter((resp) => resp.vendorId !== input.vendorId);
    const rescored = scoreResponses([...withoutVendor, input]);
    return { ...r, responses: rescored, lastModifiedDate: new Date().toISOString() };
  });
  persist();
  emit();
}

export function removeQuoteResponse(rfqId: string, vendorId: string) {
  rfqs = rfqs.map((r) => {
    if (r.id !== rfqId) return r;
    const remaining = r.responses.filter((resp) => resp.vendorId !== vendorId);
    const rescored = scoreResponses(remaining);
    const awardedVendorId = r.awardedVendorId === vendorId ? undefined : r.awardedVendorId;
    return { ...r, responses: rescored, awardedVendorId, lastModifiedDate: new Date().toISOString() };
  });
  persist();
  emit();
}

export function awardRFQ(rfqId: string, vendorId: string | undefined) {
  rfqs = rfqs.map((r) =>
    r.id === rfqId
      ? { ...r, awardedVendorId: vendorId, lastModifiedDate: new Date().toISOString() }
      : r
  );
  persist();
  emit();
}

/** Derived status — RFQs don't store status directly; it's computed from responses, unless manually overridden. */
export function getRFQStatus(
  r: RequestForQuotation
): "open" | "partial" | "quoted" | "awarded" | "cancelled" | "closed" {
  if (r.manualStatus) return r.manualStatus;
  if (r.awardedVendorId) return "awarded";
  if (r.responses.length === 0) return "open";
  if (r.responses.length < r.vendorIds.length) return "partial";
  return "quoted";
}
