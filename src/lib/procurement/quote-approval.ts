import { getAutomationRulesSnapshot } from "@/lib/settings/automation-rules-store";

/**
 * Who needs to sign off on a quote, based on cost — per Ben and Sjaak's
 * structure: small purchases just need Sjaak, mid-size need Sjaak and
 * Carlo too, and anything sizeable needs Ben as well. Thresholds and
 * names are editable in Settings > Automation Rules rather than
 * hardcoded, so this stays correct if the tiers ever change.
 */
export function getRequiredApprovers(totalCost: number): string {
  const rules = getAutomationRulesSnapshot();
  if (totalCost <= rules.quoteApprovalTier1Threshold) return rules.tier1Approvers;
  if (totalCost <= rules.quoteApprovalTier2Threshold) return rules.tier2Approvers;
  return rules.tier3Approvers;
}
