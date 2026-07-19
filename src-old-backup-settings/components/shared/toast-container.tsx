"use client";
import { CheckCircle2, Info, X } from "lucide-react";
import { useToasts } from "@/hooks/use-toasts";
import { dismissToast } from "@/lib/toast/toast-store";

export function ToastContainer() {
  const toasts = useToasts();

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2 print:hidden">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-2.5 rounded-lg border px-4 py-3 shadow-lg ${
            t.tone === "success" ? "border-success/30 bg-success-soft" : "border-info/30 bg-info-soft"
          }`}
        >
          {t.tone === "success" ? (
            <CheckCircle2 className="size-4 shrink-0 text-success" />
          ) : (
            <Info className="size-4 shrink-0 text-info-foreground" />
          )}
          <span className="text-sm font-medium text-foreground">{t.message}</span>
          {t.action && (
            <button
              onClick={() => {
                t.action!.onClick();
                dismissToast(t.id);
              }}
              className="text-sm font-semibold text-primary hover:underline"
            >
              {t.action.label}
            </button>
          )}
          <button onClick={() => dismissToast(t.id)} className="text-muted-foreground hover:text-foreground">
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
