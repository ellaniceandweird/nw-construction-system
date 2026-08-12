import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names safely, resolving conflicting utility classes.
 * Used throughout every UI primitive and feature component.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
