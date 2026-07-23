interface PrintActivityRow {
  key: string;
  activity: string;
  start: string;
  finish: string;
  extra?: string; // e.g. duration, manpower
  status: string;
  /** True if this activity has a parent — indented and shown under it. */
  isSubActivity?: boolean;
}

export interface PrintProjectGroup {
  projectId: string;
  projectName: string;
  rows: PrintActivityRow[];
}

const STATUS_COLOR: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  "in progress": "bg-blue-100 text-blue-800",
  delayed: "bg-red-100 text-red-800",
  blocked: "bg-red-100 text-red-800",
  "not started": "bg-gray-100 text-gray-700",
  ready: "bg-sky-100 text-sky-800",
  cancelled: "bg-gray-100 text-gray-500",
};

function StatusChip({ status }: { status: string }) {
  const cls = STATUS_COLOR[status] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${cls}`}>
      {status}
    </span>
  );
}

/**
 * Clean, print-only data table. Hidden on screen (`hidden`), shown only
 * when printing (`print:block`). Always renders the FULL data set passed
 * to it — every project, and every activity (including sub-activities
 * under a parent) — not whatever happens to be filtered/collapsed/
 * scrolled on screen, so printing the Master Schedule always gives a
 * complete, readable document instead of a clipped screenshot.
 *
 * Grouped by project with a section header per project (with a page
 * break before each new section after the first) so a multi-project
 * schedule reads as a real document, not one giant undifferentiated
 * table.
 */
export function SchedulePrintTable({
  title,
  groups,
  extraLabel,
}: {
  title: string;
  groups: PrintProjectGroup[];
  extraLabel?: string;
}) {
  return (
    <div className="hidden print:block">
      <h2 className="mb-4 text-base font-semibold">{title}</h2>
      {groups.map((group, i) => (
        <div key={group.projectId} style={{ pageBreakBefore: i > 0 ? "always" : "auto" }}>
          <h3 className="mb-2 mt-4 border-b border-black/40 pb-1 text-sm font-semibold first:mt-0">
            {group.projectName}
            <span className="ml-2 text-xs font-normal text-gray-500">
              ({group.rows.length} {group.rows.length === 1 ? "activity" : "activities"})
            </span>
          </h3>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-black/40 text-left">
                <th className="py-1.5 pr-3">Activity</th>
                <th className="py-1.5 pr-3">Start</th>
                <th className="py-1.5 pr-3">Finish</th>
                {extraLabel && <th className="py-1.5 pr-3">{extraLabel}</th>}
                <th className="py-1.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {group.rows.map((r) => (
                <tr key={r.key} className="border-b border-black/15">
                  <td className={`py-1.5 pr-3 ${r.isSubActivity ? "pl-4 text-gray-600" : "font-medium"}`}>
                    {r.isSubActivity ? "↳ " : ""}
                    {r.activity}
                  </td>
                  <td className="py-1.5 pr-3">{r.start}</td>
                  <td className="py-1.5 pr-3">{r.finish}</td>
                  {extraLabel && <td className="py-1.5 pr-3">{r.extra}</td>}
                  <td className="py-1.5">
                    <StatusChip status={r.status} />
                  </td>
                </tr>
              ))}
              {group.rows.length === 0 && (
                <tr>
                  <td colSpan={extraLabel ? 5 : 4} className="py-2 text-gray-500">
                    No activities scheduled yet for this project.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ))}
      {groups.length === 0 && <p className="text-sm text-gray-500">No data to print.</p>}
    </div>
  );
}
