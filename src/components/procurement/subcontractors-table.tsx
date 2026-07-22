"use client";

import * as React from "react";
import { Pencil, Search, ArrowUpDown } from "lucide-react";

import { useVendors } from "@/hooks/use-vendors";
import { toggleVendorRecommended } from "@/lib/procurement/vendor-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VendorEditDialog } from "@/components/procurement/vendor-edit-dialog";
import { CopyableText } from "@/components/shared/copyable-text";
import type { Vendor } from "@/types/procurement";

/** Subcontractor tab: vendor records tagged supplierType "subcontractor". */
export function SubcontractorsTable() {
  const vendors = useVendors();
  const [editingVendor, setEditingVendor] = React.useState<Vendor | null>(null);
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<"name" | "trade">("name");

  const subs = vendors.filter((v) => v.supplierType === "subcontractor");
  const categories = [...new Set(subs.map((v) => v.trade ?? v.vendorCategory))].sort();
  const filtered = subs.filter((v) => {
    const category = v.trade ?? v.vendorCategory;
    if (categoryFilter !== "all" && category !== categoryFilter) return false;
    if (!search) return true;
    const haystack = `${v.vendorName} ${category} ${v.primaryContact ?? ""}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });
  const sorted = [...filtered].sort((a, b) =>
    sortBy === "name" ? a.vendorName.localeCompare(b.vendorName) : (a.trade ?? a.vendorCategory).localeCompare(b.trade ?? b.vendorCategory)
  );

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[12rem]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search subcontractors…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="All Trades" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Trades</SelectItem>
            {categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[160px]"><ArrowUpDown className="size-3.5 text-muted-foreground" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="trade">Trade (A-Z)</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{sorted.length} of {subs.length}</span>
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Subcontractor</th>
              <th className="px-4 py-3 font-medium">Trade</th>
              <th className="px-4 py-3 font-medium">Contact Person</th>
              <th className="px-4 py-3 font-medium">Contact Number</th>
              <th className="px-4 py-3 font-medium">Email Address</th>
              <th className="px-4 py-3 font-medium">Notes</th>
              <th className="px-4 py-3 font-medium text-center">Recommended</th>
              <th className="px-4 py-3 font-medium">Edit</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((v) => (
              <tr key={v.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{v.vendorName}</td>
                <td className="px-4 py-3 text-muted-foreground">{v.trade ?? v.vendorCategory}</td>
                <td className="px-4 py-3 text-muted-foreground">{v.primaryContact ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{v.phone ? <CopyableText value={v.phone} href={`tel:${v.phone}`} /> : "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{v.email ? <CopyableText value={v.email} href={`mailto:${v.email}`} /> : "—"}</td>
                <td className="px-4 py-3 text-muted-foreground max-w-xs">{v.notes ?? "—"}</td>
                <td className="px-4 py-3 text-center">
                  <Checkbox
                    checked={!!v.isPreferredVendor}
                    onCheckedChange={(checked) => toggleVendorRecommended(v.id, checked === true)}
                  />
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="icon" onClick={() => setEditingVendor(v)}>
                    <Pencil className="size-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">
                  No subcontractors yet — set a vendor's Type to "Subcontractor" from the Vendors tab to move it here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <VendorEditDialog
        vendor={editingVendor}
        open={!!editingVendor}
        onOpenChange={(open) => !open && setEditingVendor(null)}
      />
    </>
  );
}
