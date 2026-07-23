export interface PrintGanttItem {
  key: string;
  label: string;
  sublabel?: string;
  leftPercent: number;
  widthPercent: number;
  colorClass: string; // Tailwind bg-* class, resolved ahead of time by the caller
  isCritical?: boolean;
  isSubActivity?: boolean;
}

export interface PrintGanttGroup {
  projectId: string;
  projectName: string;
  items: PrintGanttItem[];
}

interface WeekMarker {
  label: string;
  leftPercent: number;
}

/**
 * Print-only Gantt bar visualization. The interactive on-screen chart is
 * marked `print:hidden` (it relies on horizontal scroll + sticky columns
 * that don't translate to a printed page), so without this, printing a
 * lookahead only ever produced a flat data table — no bars at all. This
 * renders the same percentage-positioned bars as the screen version,
 * grouped by project, sized to fit a printed page width.
 */
export function PrintGanttChart({
  title,
  weekMarkers,
  groups,
}: {
  title: string;
  weekMarkers: WeekMarker[];
  groups: PrintGanttGroup[];
}) {
  return (
    <div className="hidden print:block">
      <h2 className="mb-4 text-base font-semibold">{title}</h2>
      {groups.map((group, gi) => (
        <div key={group.projectId} style={{ pageBreakBefore: gi > 0 ? "always" : "auto" }}>
          <h3 className="mb-2 mt-4 border-b border-black/40 pb-1 text-sm font-semibold first:mt-0">
            {group.projectName}
          </h3>
          <div className="relative mb-1 h-5 border-b border-black/30 text-[9px] text-gray-500">
            {weekMarkers.map((w) => (
              <div key={w.label} className="absolute top-0 border-l border-black/20 pl-1" style={{ left: `${w.leftPercent}%` }}>
                {w.label}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1.5 py-1">
            {group.items.map((item) => (
              <div key={item.key} className="flex items-center gap-2">
                <div className="w-40 shrink-0 truncate text-[10px]" title={item.label}>
                  {item.isSubActivity ? "↳ " : ""}
                  {item.label}
                </div>
                <div className="relative h-4 flex-1 border-l border-black/10">
                  {weekMarkers.map((w) => (
                    <div key={w.label} className="absolute top-0 h-full border-l border-black/10" style={{ left: `${w.leftPercent}%` }} />
                  ))}
                  <div
                    className={`absolute top-0.5 h-3 rounded-sm ${item.colorClass} ${item.isCritical ? "ring-1 ring-black" : ""}`}
                    style={{ left: `${item.leftPercent}%`, width: `${Math.max(item.widthPercent, 0.6)}%` }}
                    title={`${item.label}: ${item.sublabel ?? ""}`}
                  />
                </div>
              </div>
            ))}
            {group.items.length === 0 && (
              <p className="py-1 text-[10px] text-gray-500">No activities scheduled in this window.</p>
            )}
          </div>
        </div>
      ))}
      {groups.length === 0 && <p className="text-sm text-gray-500">No data to print.</p>}
    </div>
  );
}
