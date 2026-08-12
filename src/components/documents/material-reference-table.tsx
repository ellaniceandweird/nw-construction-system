"use client";
import * as React from "react";
import { Pencil, Plus, Search, ExternalLink } from "lucide-react";

import { useMaterialReferences } from "@/hooks/use-material-references";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MaterialReferenceEditDialog } from "@/components/documents/material-reference-edit-dialog";
import type { MaterialReference } from "@/types/material-reference";

export function MaterialReferenceTable() {
  const items = useMaterialReferences();
  const [search, setSearch] = React.useState("");
  const [editing, setEditing] = React.useState<MaterialReference | null>(null);
  const [creating, setCreating] = React.useState(false);

  const filtered = items.filter((m) => {
    if (!search) return true;
    return `${m.materialName} ${m.category ?? ""} ${m.preferredVendor ?? ""}`.toLowerCase().includes(search.toLowerCase());
  });

  const sorted = [...filtered].sort((a, b) => a.materialName.localeCompare(b.materialName));

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Spec sheets, preferred vendors, and reference notes per material — separate from
          Cost Database (pricing) and Takeoff (job quantities).
        </p>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="size-3.5" /> Add Material
        </Button>
      </div>

      <div className="mb-3 flex items-center gap-3">
        <div className="relative flex-1 min-w-[12rem] max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search material, category, vendor…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <span className="text-sm text-muted-foreground">{sorted.length} of {items.length}</span>
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Material</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Specification</th>
              <th className="px-4 py-3 font-medium">Preferred Vendor</th>
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m) => (
              <tr key={m.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{m.materialName}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.category || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground max-w-sm">{m.specification || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.preferredVendor || "—"}</td>
                <td className="px-4 py-3">
                  {m.referenceUrl ? (
                    <a href={m.referenceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                      Link <ExternalLink className="size-3" />
                    </a>
                  ) : "—"}
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(m)}>
                    <Pencil className="size-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  {items.length === 0 ? "No materials yet — add the first one above." : "No materials match your search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <MaterialReferenceEditDialog item={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      <MaterialReferenceEditDialog item={null} open={creating} onOpenChange={setCreating} />
    </>
  );
}
