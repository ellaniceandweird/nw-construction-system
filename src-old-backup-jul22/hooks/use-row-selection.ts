"use client";
import * as React from "react";

/** Reusable row-selection state for bulk actions in any table — pass the current page's row IDs in. */
export function useRowSelection(allIds: string[]) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    setSelected((prev) => (prev.size === allIds.length ? new Set() : new Set(allIds)));
  }
  function clear() {
    setSelected(new Set());
  }

  const allSelected = allIds.length > 0 && selected.size === allIds.length;
  const someSelected = selected.size > 0 && !allSelected;

  return { selected, toggle, toggleAll, clear, allSelected, someSelected, count: selected.size };
}
