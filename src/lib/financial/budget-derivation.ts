import type { Estimate } from "@/types/estimating";
import type { Budget } from "@/types/financial";

/**
 * Maps an approved Estimate's line items into the 11-category Budget
 * breakdown (SDS §10.5), using cost-code prefixes to route items that
 * belong under General Conditions (01), and each line item's own labor/
 * material/equipment/subcontract split for everything else. This is the
 * starting point for "Create Budget from Estimate" — the categories are
 * fully editable afterward since a Budget lives independently once created.
 */
export function deriveBudgetCategoriesFromEstimate(estimate: Estimate): Budget["categories"] {
  const categories: Budget["categories"] = {
    labor: 0,
    materials: 0,
    equipment: 0,
    subcontracts: 0,
    generalConditions: 0,
    permits: 0,
    insurance: 0,
    temporaryFacilities: 0,
    overhead: 0,
    contingency: 0,
    profit: 0,
  };

  for (const li of estimate.lineItems) {
    const code = li.costCode ?? "";
    const isGeneralConditions = code.startsWith("01");
    const isPermits = /permit/i.test(li.description);
    const isTempFacilities = /temporary facilit/i.test(li.description);
    const isOfficeOverhead = /office overhead/i.test(li.description);

    if (isPermits) {
      categories.permits += li.materialCost + li.laborCost;
    } else if (isTempFacilities) {
      categories.temporaryFacilities += li.materialCost + li.laborCost;
    } else if (isOfficeOverhead) {
      categories.overhead += li.materialCost + li.laborCost;
    } else if (isGeneralConditions) {
      categories.generalConditions += li.materialCost + li.laborCost;
    } else {
      categories.labor += li.laborCost;
      categories.materials += li.materialCost;
      categories.equipment += li.equipmentCost;
      categories.subcontracts += li.subcontractCost;
    }
  }

  if (estimate.indirectCosts) {
    categories.generalConditions += estimate.indirectCosts.generalConditions ?? 0;
    categories.temporaryFacilities += estimate.indirectCosts.temporaryFacilities ?? 0;
    categories.permits += estimate.indirectCosts.permits ?? 0;
    categories.insurance += estimate.indirectCosts.insurance ?? 0;
    categories.overhead += estimate.indirectCosts.officeOverhead ?? 0;
  }

  const lineItemSubtotal = estimate.lineItems.reduce((sum, li) => sum + li.totalCost, 0);
  const contingencyPct =
    (estimate.contingency?.constructionContingencyPercent ?? 0) +
    (estimate.contingency?.designContingencyPercent ?? 0) +
    (estimate.contingency?.escalationPercent ?? 0);
  const profitPct =
    (estimate.contingency?.profitPercent ?? 0) + (estimate.contingency?.corporateOverheadPercent ?? 0);
  const insurancePct = estimate.contingency?.insurancePercent ?? 0;
  const bondPct = estimate.contingency?.bondPercent ?? 0;
  const salesTaxPct = estimate.contingency?.salesTaxPercent ?? 0;

  categories.contingency += lineItemSubtotal * (contingencyPct / 100);
  categories.profit += lineItemSubtotal * (profitPct / 100);
  categories.insurance += lineItemSubtotal * (insurancePct / 100);
  categories.overhead += lineItemSubtotal * ((bondPct + salesTaxPct) / 100);

  return categories;
}

export function sumBudgetCategories(categories: Budget["categories"]): number {
  return Object.values(categories).reduce((sum, v) => sum + v, 0);
}
