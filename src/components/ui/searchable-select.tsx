"use client";

import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SearchableOption {
  value: string;
  label: string;
}

/**
 * Narrows a list as the person types. Names that START with what was
 * typed come first; from two characters on, names that merely contain it
 * follow below (so "hotel" still finds "Mr Cat Hotel"). A single typed
 * letter shows only names starting with that letter — type "K" and you
 * get the K's, nothing else.
 */
export function filterSearchOptions<T extends { label: string }>(options: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return options;
  const starts = options.filter((o) => o.label.toLowerCase().startsWith(q));
  if (q.length < 2) return starts;
  const contains = options.filter((o) => !o.label.toLowerCase().startsWith(q) && o.label.toLowerCase().includes(q));
  return [...starts, ...contains];
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: SearchableOption[];
  /** Always-visible choices at the end of the list, e.g. "Manual entry…". */
  trailingOptions?: SearchableOption[];
  /** Choices shown only while the search box is empty, e.g. "All properties". */
  leadingOptions?: SearchableOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * A dropdown with a search box: click it (or just start typing while it's
 * focused) and the list narrows as you type. Looks like the app's other
 * dropdowns. Rendered in place rather than in a portal on purpose — inside
 * a dialog, a portal would fall outside the dialog's focus handling.
 */
export function SearchableSelect({
  value,
  onChange,
  options,
  trailingOptions = [],
  leadingOptions = [],
  placeholder = "Select…",
  searchPlaceholder = "Type to search…",
  className,
  disabled,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [highlight, setHighlight] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const matches = filterSearchOptions(options, query);
  const visible: SearchableOption[] = [...(query.trim() ? [] : leadingOptions), ...matches, ...trailingOptions];
  const allOptions = [...leadingOptions, ...options, ...trailingOptions];
  const selectedLabel = allOptions.find((o) => o.value === value)?.label ?? (value || "");

  React.useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  React.useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function openWith(seed = "") {
    setQuery(seed);
    setHighlight(0);
    setOpen(true);
  }

  function choose(option: SearchableOption) {
    onChange(option.value);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openWith())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openWith();
          } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            // Typing on the closed dropdown opens it with that letter already
            // entered, so "K" goes straight to the K's.
            e.preventDefault();
            openWith(e.key);
          }
        }}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 py-1 text-sm shadow-xs outline-none focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={cn("truncate text-left", !selectedLabel && "text-muted-foreground")}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className="size-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-[12rem] rounded-lg border border-border bg-popover text-popover-foreground shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-2.5">
            <Search className="size-3.5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              placeholder={searchPlaceholder}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlight(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setHighlight((h) => Math.min(h + 1, visible.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setHighlight((h) => Math.max(h - 1, 0));
                } else if (e.key === "Enter") {
                  e.preventDefault(); // don't submit a surrounding form
                  if (visible[highlight]) choose(visible[highlight]);
                } else if (e.key === "Tab") {
                  setOpen(false);
                }
              }}
              className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div role="listbox" className="max-h-56 overflow-y-auto p-1">
            {visible.map((o, i) => {
              const isTrailing = i >= visible.length - trailingOptions.length && trailingOptions.length > 0;
              return (
                <button
                  key={`${o.value}-${i}`}
                  type="button"
                  role="option"
                  aria-selected={o.value === value}
                  ref={(el) => {
                    if (el && i === highlight) el.scrollIntoView({ block: "nearest" });
                  }}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => choose(o)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
                    i === highlight && "bg-accent",
                    isTrailing && i === visible.length - trailingOptions.length && "mt-1 border-t border-border/60 pt-2"
                  )}
                >
                  <Check className={cn("size-3.5 shrink-0", o.value === value ? "opacity-100" : "opacity-0")} />
                  <span className="truncate">{o.label}</span>
                </button>
              );
            })}
            {matches.length === 0 && (
              <p className="px-2 py-2 text-xs text-muted-foreground">No match for “{query.trim()}”.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
