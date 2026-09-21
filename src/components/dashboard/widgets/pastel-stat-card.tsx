import Link from "next/link";
import { DASHBOARD_COLORS, type DashboardColorKey } from "@/lib/dashboard/pastel-colors";

interface Props {
  label: string;
  value: string | number;
  tone: DashboardColorKey;
  href?: string;
}

/** A single pastel-colored KPI tile — background/text colors always come from the shared DASHBOARD_COLORS map, never a one-off hex, so meaning stays consistent across every dashboard. */
export function PastelStatCard({ label, value, tone, href }: Props) {
  const colors = DASHBOARD_COLORS[tone];
  const content = (
    <div style={{ background: colors.bg }} className="rounded-xl p-4">
      <p style={{ color: colors.text }} className="mb-1 text-xs font-medium">{label}</p>
      <p style={{ color: colors.textDark }} className="text-2xl font-medium">{value}</p>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block transition-opacity hover:opacity-80">
        {content}
      </Link>
    );
  }
  return content;
}
