interface PrintRow {
  key: string;
  project: string;
  activity: string;
  start: string;
  finish: string;
  extra?: string; // e.g. duration, manpower
  status: string;
}

/**
 * Clean, print-only data table. Hidden on screen (`hidden`), shown only
 * when printing (`print:block`). Always renders the FULL data set passed
 * to it — not whatever happens to be filtered/scrolled/visible on screen
 * — so printing a schedule always gives a complete, readable table
 * instead of a clipped screenshot of the interactive view.
 */
export function SchedulePrintTable({
  title,
  rows,
  extraLabel,
}: {
  title: string;
  rows: PrintRow[];
  extraLabel?: string;
}) {
  return (
    <div className="hidden print:block">
      <h2 className="mb-3 text-base font-semibold">{title}</h2>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-black/40 text-left">
            <th className="py-1.5 pr-3">Project</th>
            <th className="py-1.5 pr-3">Activity</th>
            <th className="py-1.5 pr-3">Start</th>
            <th className="py-1.5 pr-3">Finish</th>
            {extraLabel && <th className="py-1.5 pr-3">{extraLabel}</th>}
            <th className="py-1.5">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-b border-black/15">
              <td className="py-1.5 pr-3 font-medium">{r.project}</td>
              <td className="py-1.5 pr-3">{r.activity}</td>
              <td className="py-1.5 pr-3">{r.start}</td>
              <td className="py-1.5 pr-3">{r.finish}</td>
              {extraLabel && <td className="py-1.5 pr-3">{r.extra}</td>}
              <td className="py-1.5">{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
