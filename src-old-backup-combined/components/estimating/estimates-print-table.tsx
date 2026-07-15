"use client";

import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import type { Estimate } from "@/types/estimating";

function currency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function projectName(id: string) {
  return MOCK_PROJECTS.find((p) => p.id === id)?.projectName ?? id;
}

/**
 * Clean, print-only summary of every estimate. Hidden on screen, shown
 * only when printing — same convention as the Schedule module's print
 * tables. Always renders the full list, not whatever happens to be
 * expanded/filtered on screen.
 */
export function EstimatesPrintTable({ estimates }: { estimates: Estimate[] }) {
  return (
    <div className="hidden print:block">
      <h2 className="mb-3 text-base font-semibold">Estimates</h2>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-black/40 text-left">
            <th className="py-1.5 pr-3">Project</th>
            <th className="py-1.5 pr-3">Estimate #</th>
            <th className="py-1.5 pr-3">Date</th>
            <th className="py-1.5 pr-3">Rev</th>
            <th className="py-1.5 pr-3">Status</th>
            <th className="py-1.5">Total</th>
          </tr>
        </thead>
        <tbody>
          {estimates.map((e) => (
            <tr key={e.id} className="border-b border-black/15">
              <td className="py-1.5 pr-3 font-medium">{projectName(e.projectId)}</td>
              <td className="py-1.5 pr-3">{e.estimateNumber}</td>
              <td className="py-1.5 pr-3">{formatDate(e.estimateDate)}</td>
              <td className="py-1.5 pr-3">Rev {e.revision}</td>
              <td className="py-1.5 pr-3">{e.estimateStatus.replace(/_/g, " ")}</td>
              <td className="py-1.5">{currency(e.totalEstimatedCost)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
