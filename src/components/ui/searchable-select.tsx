"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SearchableOption {
  value: string;
  /** Plain text — what gets searched, and what shows if there's no `render`. */
  label: string;
  /** Optional richer content to show for this option in the list and in the closed dropdown. */
  render?: React.ReactNode;
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
  /** Layout classes (width, margin…) for the wrapper around the dropdown. */
  className?: string;
  /** Classes for the closed dropdown button itself (height, text size…). */
  triggerClassName?: string;
  disabled?: boolean;
  /**
   * The search box only appears when there are at least this many options —
   * a 3-item Status list doesn't need one. 0 (the default) always shows it.
   */
  searchThreshold?: number;
  /** If the current value matches no option, show the raw value (true) or the placeholder (false). */
  showUnknownValue?: boolean;
}

const PANEL_HEIGHT_GUESS = 280;

/**
 * A dropdown that can be searched by typing. The list is drawn outside the
 * element it's inside of — into the surrounding form window if there is
 * one, otherwise onto the page — so a table's or card's scroll area can't
 * clip it. Inside a form window it deliberately goes into that window
 * rather than the page, so the window's focus handling keeps working.
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
  triggerClassName,
  disabled,
  searchThreshold = 0,
  showUnknownValue = true,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [highlight, setHighlight] = React.useState(0);
  const [place, setPlace] = React.useState<{ host: HTMLElement; top: number; left: number; width: number; up: boolean } | null>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const showSearch = options.length >= searchThreshold;
  const matches = filterSearchOptions(options, showSearch ? query : "");
  const searching = showSearch && query.trim() !== "";
  const visible: SearchableOption[] = [...(searching ? [] : leadingOptions), ...matches, ...trailingOptions];
  const allOptions = [...leadingOptions, ...options, ...trailingOptions];
  const selected = allOptions.find((o) => o.value === value);
  const closedLabel: React.ReactNode = selected ? (selected.render ?? selected.label) : showUnknownValue ? value : "";

  const reposition = React.useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const host = (trigger.closest('[role="dialog"]') as HTMLElement | null) ?? document.body;
    const t = trigger.getBoundingClientRect();
    const hostRect = host === document.body ? { top: 0, bottom: window.innerHeight, left: 0 } : host.getBoundingClientRect();
    const spaceBelow = Math.min(window.innerHeight, hostRect.bottom) - t.bottom;
    const spaceAbove = t.top - Math.max(0, hostRect.top);
    const up = spaceBelow < PANEL_HEIGHT_GUESS && spaceAbove > spaceBelow;
    const edgeY = up ? t.top : t.bottom;
    let top: number;
    let left: number;
    if (host === document.body) {
      top = edgeY + window.scrollY;
      left = t.left + window.scrollX;
    } else {
      top = edgeY - hostRect.top - host.clientTop + host.scrollTop;
      left = t.left - hostRect.left - host.clientLeft + host.scrollLeft;
    }
    setPlace({ host, top, left, width: t.width, up });
  }, []);

  React.useLayoutEffect(() => {
    if (!open) return;
    reposition();
    window.addEventListener("resize", reposition);
    document.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      document.removeEventListener("scroll", reposition, true);
    };
  }, [open, reposition]);

  React.useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  React.useEffect(() => {
    if (open && showSearch) inputRef.current?.focus();
  }, [open, showSearch, place]);

  function openWith(seed = "") {
    setQuery(seed);
    const start = seed ? 0 : Math.max(0, [...leadingOptions, ...options, ...trailingOptions].findIndex((o) => o.value === value));
    setHighlight(start);
    setOpen(true);
  }

  function choose(option: SearchableOption) {
    onChange(option.value);
    setOpen(false);
    setQuery("");
    triggerRef.current?.focus();
  }

  /** Arrow keys + Enter, shared by the search box and (for lists without one) the closed button. */
  function listKey(e: React.KeyboardEvent): boolean {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, visible.length - 1));
      return true;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
      return true;
    }
    if (e.key === "Enter") {
      e.preventDefault(); // never submit a surrounding form
      if (visible[highlight]) choose(visible[highlight]);
      return true;
    }
    if (e.key === "Tab") {
      setOpen(false);
      return true;
    }
    return false;
  }

  const panel =
    open && place
      ? createPortal(
          <div
            ref={panelRef}
            style={{
              position: "absolute",
              top: place.up ? place.top - 4 : place.top + 4,
              left: place.left,
              width: Math.max(place.width, 192),
              transform: place.up ? "translateY(-100%)" : undefined,
              zIndex: 100,
            }}
            className="rounded-lg border border-border bg-popover text-popover-foreground shadow-lg"
          >
            {showSearch && (
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
                    listKey(e);
                  }}
                  className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            )}
            <div role="listbox" className="max-h-56 overflow-y-auto p-1">
              {visible.map((o, i) => {
                const firstTrailing = trailingOptions.length > 0 && i === visible.length - trailingOptions.length;
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
                      firstTrailing && "mt-1 border-t border-border/60 pt-2"
                    )}
                  >
                    <Check className={cn("size-3.5 shrink-0", o.value === value ? "opacity-100" : "opacity-0")} />
                    <span className="min-w-0 flex-1 truncate">{o.render ?? o.label}</span>
                  </button>
                );
              })}
              {matches.length === 0 && showSearch && (
                <p className="px-2 py-2 text-xs text-muted-foreground">No match for “{query.trim()}”.</p>
              )}
            </div>
          </div>,
          place.host
        )
      : null;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openWith())}
        onKeyDown={(e) => {
          if (open) {
            if (!showSearch) listKey(e);
            return;
          }
          if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openWith();
          } else if (showSearch && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            // Typing on the closed dropdown opens it with that letter already
            // entered, so "K" goes straight to the K's.
            e.preventDefault();
            openWith(e.key);
          }
        }}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 py-1 text-sm shadow-xs outline-none focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50",
          triggerClassName
        )}
      >
        <span className={cn("min-w-0 truncate text-left", !closedLabel && "text-muted-foreground")}>
          {closedLabel || placeholder}
        </span>
        <ChevronDown className="size-4 shrink-0 opacity-50" />
      </button>
      {panel}
    </div>
  );
}
