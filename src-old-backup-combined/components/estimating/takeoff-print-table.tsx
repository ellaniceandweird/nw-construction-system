"use client";

import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import type { TakeoffItem } from "@/types/estimating";

function projectName(id: string) {
  return MOCK_PROJECTS.find((p) => p.id === id)?.projectName ?? id;
}

/**
 * Clean, print-only summary of every takeoff item, grouped by project.
 * Hidden on screen, shown only when printing — same convention as the
 * Schedule module's print tables.
 */
export function TakeoffPrintTable({ items }: { items: TakeoffItem[] }) {
  const byProject = new Map<string, TakeoffItem[]>();
  for (const t of items) {
    if (!byProject.has(t.projectId)) byProject.set(t.projectId, []);
    byProject.get(t.projectId)!.push(t);
  }
  const projectIds = [...byProject.keys()].sort((a, b) => projectName(a).localeCompare(projectName(b)));

  return (
    <div className="hidden print:block">
      <h2 className="mb-3 text-base font-semibold">Takeoff</h2>
      {projectIds.map((projectId) => (
        <div key={projectId} className="mb-4">
          <h3 className="mb-1.5 text-sm font-semibold">{projectName(projectId)}</h3>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-black/40 text-left">
                <th className="py-1.5 pr-3">Description</th>
                <th className="py-1.5 pr-3">Cost Code</th>
                <th className="py-1.5 pr-3">Quantity</th>
                <th className="py-1.5 pr-3">Waste %</th>
                <th className="py-1.5">Adjusted Qty</th>
              </tr>
            </thead>
            <tbody>
              {byProject.get(projectId)!.map((t) => (
                <tr key={t.id} className="border-b border-black/15">
                  <td className="py-1.5 pr-3">{t.description}</td>
                  <td className="py-1.5 pr-3">{t.costCode ?? "—"}</td>
                  <td className="py-1.5 pr-3">
                    {t.quantity.toLocaleString()} {t.unit}
                  </td>
                  <td className="py-1.5 pr-3">{t.wasteFactorPercent != null ? `${t.wasteFactorPercent}%` : "—"}</td>
                  <td className="py-1.5">
                    {t.adjustedQuantity.toLocaleString()} {t.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
