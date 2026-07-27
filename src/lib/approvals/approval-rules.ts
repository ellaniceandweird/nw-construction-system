import type { ApprovalKind, ApproverName } from "@/types/approvals";

/**
 * Budgets and Change Orders always need all three, regardless of amount.
 * Quotes (Estimates) and Purchase Orders scale by dollar amount:
 *   - up to $1,000: Sjaak only
 *   - $1,000.01–$3,000: Sjaak and Carlo
 *   - over $3,000: Sjaak, Carlo, and Ben
 */
export function computeRequiredApprovers(kind: ApprovalKind, amount: number): ApproverName[] {
  if (kind === "budget" || kind === "change_order") {
    return ["Sjaak", "Carlo", "Ben"];
  }
  // estimate (quote), purchase_order, and manual entries follow the threshold rule.
  const absAmount = Math.abs(amount);
  if (absAmount <= 1000) return ["Sjaak"];
  if (absAmount <= 3000) return ["Sjaak", "Carlo"];
  return ["Sjaak", "Carlo", "Ben"];
}
