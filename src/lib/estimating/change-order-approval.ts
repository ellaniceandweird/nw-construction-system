import { getAutomationRulesSnapshot } from "@/lib/settings/automation-rules-store";

/**
 * Ben and Sjaak's 2026-07-20 discussion: change orders within the
 * approved budget don't need separate sign-off, but anything beyond a
 * threshold should escalate to Ben/Carlo instead of staying with
 * Sjaak/Ella. The threshold is editable in Settings > Automation Rules.
 */
export function getOwnerApprovalThreshold(): number {
  return getAutomationRulesSnapshot().changeOrderApprovalThreshold;
}

export function requiresOwnerApproval(costImpact: number): boolean {
  return Math.abs(costImpact) > getOwnerApprovalThreshold();
}
