"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface Slice {
  label: string;
  value: number;
  color: string;
}

interface Props {
  data: Slice[];
  height?: number;
  centerLabel?: string;
}

/** A donut chart with each slice's value labeled directly on the slice, plus a legend below showing label + value together (never color alone) — colors always come from the shared DASHBOARD_COLORS map via the caller. */
export function PastelDonutChart({ data, height = 200, centerLabel }: Props) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <div className="flex flex-col gap-2">
      <div className="relative" style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="55%"
              outerRadius="90%"
              paddingAngle={2}
              strokeWidth={0}
              label={(props: { value?: number }) => (typeof props.value === "number" && props.value > 0 ? props.value : "")}
              labelLine={false}
            >
              {data.map((d) => (
                <Cell key={d.label} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {centerLabel && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-medium text-foreground">{total}</span>
            <span className="text-[10px] text-muted-foreground">{centerLabel}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
        {data.map((d) => (
          <span key={d.label} className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm" style={{ background: d.color }} />
            {d.label} — {d.value}
          </span>
        ))}
      </div>
    </div>
  );
}
