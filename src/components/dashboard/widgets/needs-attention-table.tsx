import Link from "next/link";
import { DASHBOARD_COLORS, type DashboardColorKey } from "@/lib/dashboard/pastel-colors";

export interface AttentionItem {
  id: string;
  label: string;
  detail: string;
  tone: DashboardColorKey;
  statusLabel: string;
  href?: string;
}

interface Props {
  items: AttentionItem[];
  emptyLabel?: string;
}

/** The "Needs Attention" table shown at the bottom of every dashboard — same shape everywhere, populated with whatever's relevant to that specific dashboard's domain. */
export function NeedsAttentionTable({ items, emptyLabel = "Nothing needs attention right now." }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 text-base font-medium">Needs attention</h3>
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="pb-2 pr-3 font-normal">Item</th>
              <th className="pb-2 pr-3 font-normal">Detail</th>
              <th className="pb-2 text-right font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const colors = DASHBOARD_COLORS[item.tone];
              return (
                <tr key={item.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                  <td className="py-2 pr-3 font-medium text-foreground">
                    {item.href ? <Link href={item.href} className="block">{item.label}</Link> : item.label}
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">{item.detail}</td>
                  <td className="py-2 text-right">
                    <span style={{ background: colors.bg, color: colors.text }} className="rounded-md px-2.5 py-0.5 text-xs">
                      {item.statusLabel}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
