"use client";

import * as React from "react";

import { SearchableSelect, type SearchableOption } from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";

/**
 * The app's standard dropdown. It keeps the same building blocks as before
 * (Select / SelectTrigger / SelectValue / SelectContent / SelectItem) so
 * every screen keeps working exactly as written — but each one is now a
 * searchable dropdown underneath. Click it (or just start typing while it's
 * highlighted) and the list narrows as you type.
 *
 * A list with fewer than SEARCH_MIN_OPTIONS choices (a 3-item Status, say)
 * skips the search box, since typing to find one of three is just clutter —
 * it's still the same dropdown, just without the box. Change the number
 * below to make smaller lists searchable too.
 */
export const SEARCH_MIN_OPTIONS = 8;

// These are markers the Select reads its settings from — they draw nothing
// themselves, which is why they accept (and ignore) whatever props the
// screens already pass them.
const SelectTrigger: React.FC<{ className?: string; children?: React.ReactNode }> = () => null;
const SelectValue: React.FC<{ placeholder?: React.ReactNode }> = () => null;
const SelectContent: React.FC<{ className?: string; children?: React.ReactNode }> = () => null;
const SelectItem: React.FC<{ value: string; className?: string; children?: React.ReactNode }> = () => null;
function SelectGroup({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

type MarkerElement = React.ReactElement<{
  children?: React.ReactNode;
  className?: string;
  value?: string;
  placeholder?: React.ReactNode;
}>;

function walk(node: React.ReactNode, visit: (el: MarkerElement) => boolean | void) {
  React.Children.forEach(node, (child) => {
    if (!React.isValidElement(child)) return;
    if (visit(child as MarkerElement) === false) return;
    const children = (child.props as { children?: React.ReactNode }).children;
    if (children) walk(children, visit);
  });
}

function textOf(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (React.isValidElement(node)) return textOf((node.props as { children?: React.ReactNode }).children);
  return "";
}

/**
 * A trigger's className mixes two things: where the dropdown sits (width,
 * margins) and how the button looks (height, text size). They belong on
 * different elements, so split them.
 */
const LAYOUT_CLASS = /^(?:-?m[trblxy]?-|w-|min-w-|max-w-|flex-|basis-|grow|shrink|self-|col-span-|row-span-|order-|hidden$)/;
export function splitTriggerClasses(className: string | undefined): { layout: string; button: string } {
  const layout: string[] = [];
  const button: string[] = [];
  for (const token of (className ?? "").split(/\s+/).filter(Boolean)) {
    const base = token.replace(/^(?:[a-z0-9-]+:)+/, "");
    (LAYOUT_CLASS.test(base) ? layout : button).push(token);
  }
  return { layout: layout.join(" "), button: button.join(" ") };
}

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

function Select({ value = "", onValueChange, disabled, children }: SelectProps) {
  let triggerClassName: string | undefined;
  let placeholder: string | undefined;
  const options: SearchableOption[] = [];

  walk(children, (el) => {
    if (el.type === SelectTrigger) {
      triggerClassName = el.props.className;
      walk(el.props.children, (inner) => {
        if (inner.type === SelectValue && typeof inner.props.placeholder === "string") placeholder = inner.props.placeholder;
      });
      return false;
    }
    if (el.type === SelectItem) {
      options.push({ value: el.props.value ?? "", label: textOf(el.props.children), render: el.props.children });
      return false;
    }
  });

  const { layout, button } = splitTriggerClasses(triggerClassName);
  return (
    <SearchableSelect
      value={value}
      onChange={(v) => onValueChange?.(v)}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
      className={cn("w-fit", layout)}
      triggerClassName={button}
      searchThreshold={SEARCH_MIN_OPTIONS}
      showUnknownValue={false}
    />
  );
}

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectItem };
