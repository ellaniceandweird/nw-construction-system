import type { VendorQuoteResponse } from "@/types/procurement";

/**
 * SDS §8.10 — Quote Comparison scoring.
 *
 * Scores each response 0-100 relative to the other responses on the same
 * RFQ: 60% weight on total landed cost (price + freight + tax, lower is
 * better), 40% weight on lead time (shorter is better). If there's only
 * one response, or every response is tied on a dimension, that dimension
 * scores 100 for everyone (nothing to differentiate on).
 */
export function scoreResponses<T extends Omit<VendorQuoteResponse, "overallScore">>(
  responses: T[]
): (T & { overallScore: number })[] {
  if (responses.length === 0) return [];

  const landed = responses.map((r) => r.quotedPrice + (r.freight ?? 0) + (r.tax ?? 0));
  const leadTimes = responses.map((r) => r.leadTimeDays);

  const minLanded = Math.min(...landed);
  const maxLanded = Math.max(...landed);
  const minLead = Math.min(...leadTimes);
  const maxLead = Math.max(...leadTimes);

  return responses.map((r, i) => {
    const priceScore =
      maxLanded === minLanded ? 100 : ((maxLanded - landed[i]) / (maxLanded - minLanded)) * 100;
    const leadScore =
      maxLead === minLead ? 100 : ((maxLead - leadTimes[i]) / (maxLead - minLead)) * 100;
    const overallScore = Math.round(priceScore * 0.6 + leadScore * 0.4);
    return { ...r, overallScore };
  });
}
