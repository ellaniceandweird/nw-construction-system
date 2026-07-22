/**
 * Who needs to sign off on a quote, based on cost — per Ben and Sjaak's
 * structure: small purchases just need Sjaak, mid-size need Sjaak and
 * Carlo too, and anything sizeable needs Ben as well. Automatically
 * computed from the quoted price so nobody has to remember the tiers.
 */
export function getRequiredApprovers(totalCost: number): string {
  if (totalCost <= 1000) return "Sjaak";
  if (totalCost <= 3000) return "Sjaak, Carlo";
  return "Sjaak, Carlo, Ben";
}
