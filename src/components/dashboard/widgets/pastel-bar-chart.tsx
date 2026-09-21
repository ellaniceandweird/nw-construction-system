"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList } from "recharts";

interface Series {
  key: string;
  color: string;
  label: string;
}

interface Props {
  data: Record<string, string | number>[];
  categoryKey: string;
  series: Series[];
  stacked?: boolean;
  valueFormatter?: (v: number) => string;
  height?: number;
}

/** A grouped or stacked bar chart with each bar's value labeled directly on it — legible at a glance without hovering. Colors are always passed in from DASHBOARD_COLORS by the caller, never hardcoded here. */
export function PastelBarChart({ data, categoryKey, series, stacked = false, valueFormatter = (v) => String(v), height = 220 }: Props) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey={categoryKey} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
          <YAxis hide />
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} stackId={stacked ? "stack" : undefined} radius={stacked ? 0 : [4, 4, 0, 0]}>
              <LabelList dataKey={s.key} position={stacked ? "inside" : "top"} formatter={(v: number) => (v > 0 ? valueFormatter(v) : "")} style={{ fontSize: 11, fill: stacked ? "#2c2c2a" : "var(--foreground)" }} />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
