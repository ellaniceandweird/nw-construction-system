import { cn } from "@/lib/utils";

function healthTone(score: number) {
  if (score >= 75) return { bg: "bg-success-soft", text: "text-success", ring: "stroke-success" };
  if (score >= 50) return { bg: "bg-warning-soft", text: "text-warning-foreground", ring: "stroke-warning" };
  return { bg: "bg-destructive-soft", text: "text-destructive", ring: "stroke-destructive" };
}

/** Compact numeric badge — used in tables and list rows. */
export function HealthScoreBadge({ score, className }: { score: number; className?: string }) {
  const tone = healthTone(score);
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold",
        tone.bg,
        tone.text,
        className
      )}
    >
      {score}
    </span>
  );
}

/** Larger ring gauge — used on the Project Details header. */
export function HealthScoreGauge({ score }: { score: number }) {
  const tone = healthTone(score);
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex size-20 shrink-0 items-center justify-center">
      <svg viewBox="0 0 80 80" className="size-20 -rotate-90">
        <circle cx="40" cy="40" r={radius} strokeWidth="8" className="fill-none stroke-muted" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          strokeWidth="8"
          strokeLinecap="round"
          className={cn("fill-none transition-all duration-500", tone.ring)}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-semibold text-foreground">{score}</span>
        <span className="text-[10px] text-muted-foreground">Health</span>
      </div>
    </div>
  );
}
