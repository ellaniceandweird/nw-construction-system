interface Props {
  score: number;
  size?: number;
}

function toneForScore(score: number): { stroke: string; text: string } {
  if (score >= 80) return { stroke: "var(--success)", text: "text-success" };
  if (score >= 60) return { stroke: "var(--warning)", text: "text-warning-foreground" };
  return { stroke: "var(--destructive)", text: "text-destructive" };
}

/** Circular 0-100 health score gauge — used on the Project detail page. */
export function HealthScoreGauge({ score, size = 88 }: Props) {
  const clamped = Math.max(0, Math.min(100, score));
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const tone = toneForScore(clamped);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tone.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-xl font-semibold ${tone.text}`}>{clamped}</span>
        <span className="text-[10px] text-muted-foreground">Health</span>
      </div>
    </div>
  );
}
