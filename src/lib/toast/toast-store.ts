"use client";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  message: string;
  tone: "success" | "info" | "error";
  action?: ToastAction;
  durationMs: number;
}

type Listener = () => void;

let toasts: Toast[] = [];
const listeners = new Set<Listener>();
let counter = 0;

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeToasts(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function getToastsSnapshot(): Toast[] {
  return toasts;
}

export function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function pushToast(message: string, tone: Toast["tone"], action?: ToastAction, durationMs = 4000) {
  const id = `toast-${Date.now()}-${counter++}`;
  toasts = [...toasts, { id, message, tone, action, durationMs }];
  emit();
  if (typeof window !== "undefined") {
    window.setTimeout(() => dismissToast(id), durationMs);
  }
  return id;
}

/** A quick confirmation that something saved/happened — auto-dismisses in 4s. */
export function showSuccessToast(message: string) {
  return pushToast(message, "success");
}

/** Something failed to save — stays up longer (7s) since it needs to actually be read. */
export function showErrorToast(message: string) {
  return pushToast(message, "error", undefined, 7000);
}

/**
 * A confirmation with an "Undo" action, giving a real window (6s) to reverse
 * a delete before it's gone for good — reduces the "did I just break
 * something" anxiety of a destructive action.
 */
export function showUndoToast(message: string, onUndo: () => void) {
  return pushToast(message, "info", { label: "Undo", onClick: onUndo }, 6000);
}
