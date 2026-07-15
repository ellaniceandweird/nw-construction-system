import type { Estimate, EstimateLineItem } from "@/types/estimating";

/**
 * SDS §9.14/§9.17 — Estimate Builder cost roll-up.
 *
 * Line item total: direct costs (labor + material + equipment +
 * subcontract), marked up by the line's markup %, plus any line-level tax.
 *
 * Estimate total: sum of line item totals, plus indirect costs (§9.16),
 * then each contingency/markup percentage (§9.17) applied in sequence to
 * the running subtotal — design contingency, construction contingency,
 * escalation, profit, corporate overhead, sales tax, bond, insurance,
 * retainage. Each step compounds on the prior running total, which is the
 * conventional order estimators stack markups in.
 */

export function computeLineItemTotal(
  li: Pick<EstimateLineItem, "laborCost" | "materialCost" | "equipmentCost" | "subcontractCost" | "markupPercent" | "tax">
): number {
  const direct = li.laborCost + li.materialCost + li.equipmentCost + li.subcontractCost;
  const marked = direct * (1 + (li.markupPercent ?? 0) / 100);
  return marked + (li.tax ?? 0);
}

const CONTINGENCY_ORDER: Array<keyof NonNullable<Estimate["contingency"]>> = [
  "designContingencyPercent",
  "constructionContingencyPercent",
  "escalationPercent",
  "corporateOverheadPercent",
  "profitPercent",
  "bondPercent",
  "insurancePercent",
  "salesTaxPercent",
  "retainagePercent",
];

export function computeEstimateTotal(
  lineItems: EstimateLineItem[],
  indirectCosts?: Estimate["indirectCosts"],
  contingency?: Estimate["contingency"]
): number {
  const lineItemSubtotal = lineItems.reduce((sum, li) => sum + li.totalCost, 0);
  const indirectSubtotal = indirectCosts
    ? Object.values(indirectCosts).reduce((sum, v) => sum + (v ?? 0), 0)
    : 0;

  let running = lineItemSubtotal + indirectSubtotal;
  if (contingency) {
    for (const key of CONTINGENCY_ORDER) {
      const pct = contingency[key];
      if (pct) running += running * (pct / 100);
    }
  }
  return running;
}
