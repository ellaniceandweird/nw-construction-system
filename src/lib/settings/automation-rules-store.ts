"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";

export interface AutomationRulesConfig {
  changeOrderApprovalThreshold: number;
  quoteApprovalTier1Threshold: number;
  quoteApprovalTier2Threshold: number;
  tier1Approvers: string;
  tier2Approvers: string;
  tier3Approvers: string;
}

export const DEFAULT_AUTOMATION_RULES: AutomationRulesConfig = {
  changeOrderApprovalThreshold: 5000,
  quoteApprovalTier1Threshold: 1000,
  quoteApprovalTier2Threshold: 3000,
  tier1Approvers: "Sjaak",
  tier2Approvers: "Sjaak, Carlo",
  tier3Approvers: "Sjaak, Carlo, Ben",
};

const SINGLETON_ID = "default";

interface AutomationRulesRow extends AutomationRulesConfig {
  id: string;
}

function fromRow(row: Record<string, any>): AutomationRulesRow {
  return {
    id: row.id,
    changeOrderApprovalThreshold: Number(row.change_order_approval_threshold ?? DEFAULT_AUTOMATION_RULES.changeOrderApprovalThreshold),
    quoteApprovalTier1Threshold: Number(row.quote_approval_tier1_threshold ?? DEFAULT_AUTOMATION_RULES.quoteApprovalTier1Threshold),
    quoteApprovalTier2Threshold: Number(row.quote_approval_tier2_threshold ?? DEFAULT_AUTOMATION_RULES.quoteApprovalTier2Threshold),
    tier1Approvers: row.tier1_approvers ?? DEFAULT_AUTOMATION_RULES.tier1Approvers,
    tier2Approvers: row.tier2_approvers ?? DEFAULT_AUTOMATION_RULES.tier2Approvers,
    tier3Approvers: row.tier3_approvers ?? DEFAULT_AUTOMATION_RULES.tier3Approvers,
  };
}

function toRow(input: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  if (input.id !== undefined) row.id = input.id;
  if (input.changeOrderApprovalThreshold !== undefined) row.change_order_approval_threshold = input.changeOrderApprovalThreshold;
  if (input.quoteApprovalTier1Threshold !== undefined) row.quote_approval_tier1_threshold = input.quoteApprovalTier1Threshold;
  if (input.quoteApprovalTier2Threshold !== undefined) row.quote_approval_tier2_threshold = input.quoteApprovalTier2Threshold;
  if (input.tier1Approvers !== undefined) row.tier1_approvers = input.tier1Approvers;
  if (input.tier2Approvers !== undefined) row.tier2_approvers = input.tier2Approvers;
  if (input.tier3Approvers !== undefined) row.tier3_approvers = input.tier3Approvers;
  return row;
}

const store = createCollectionStore<AutomationRulesRow>({
  table: "automation_rules",
  seedData: [{ id: SINGLETON_ID, ...DEFAULT_AUTOMATION_RULES }],
  fromRow,
  toRow,
  orderBy: "id",
});

type Listener = () => void;

export function subscribeAutomationRules(listener: Listener) {
  return store.subscribe(listener);
}

export function getAutomationRulesSnapshot(): AutomationRulesConfig {
  const row = store.getSnapshot().find((r) => r.id === SINGLETON_ID);
  return row ?? DEFAULT_AUTOMATION_RULES;
}

export async function updateAutomationRules(patch: Partial<AutomationRulesConfig>): Promise<{ ok: boolean; error?: string }> {
  const existing = store.getSnapshot().find((r) => r.id === SINGLETON_ID);
  if (existing) {
    const ok = await store.update(SINGLETON_ID, patch);
    return ok ? { ok: true } : { ok: false, error: store.getLastError() ?? undefined };
  }
  const result = await store.create({ id: SINGLETON_ID, ...DEFAULT_AUTOMATION_RULES, ...patch });
  return result !== null ? { ok: true } : { ok: false, error: store.getLastError() ?? undefined };
}
