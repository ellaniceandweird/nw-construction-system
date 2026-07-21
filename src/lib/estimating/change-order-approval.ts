/**
 * Ben and Sjaak's 2026-07-20 discussion: change orders within the
 * approved budget don't need separate sign-off, but anything beyond a
 * threshold should escalate to Ben/Carlo instead of staying with
 * Sjaak/Ella. They floated $5,000 as the number — kept as a single
 * constant here so it's easy to adjust later without hunting through
 * the table component.
 */
export const OWNER_APPROVAL_THRESHOLD = 5000;

export function requiresOwnerApproval(costImpact: number): boolean {
  return Math.abs(costImpact) > OWNER_APPROVAL_THRESHOLD;
}
