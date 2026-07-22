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

/** Vendors tab: suppliers only — subcontractors live on their own tab. */
export function VendorsTable() {
  const vendors = useVendors();
  const [editingVendor, setEditingVendor] = React.useState<Vendor | null>(null);
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<"name" | "category">("name");

  const suppliers = vendors.filter((v) => v.supplierType !== "subcontractor");
  const categories = [...new Set(suppliers.map((v) => v.vendorCategory))].sort();
  const filtered = suppliers.filter((v) => {
    const matchesCategory = categoryFilter === "all" || v.vendorCategory === categoryFilter;
    if (!matchesCategory) return false;
    if (!search) return true;
    const haystack = `${v.vendorName} ${v.vendorCategory} ${v.primaryContact ?? ""}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });
  const sorted = [...filtered].sort((a, b) =>
    sortBy === "name" ? a.vendorName.localeCompare(b.vendorName) : a.vendorCategory.localeCompare(b.vendorCategory)
  );

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[12rem]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search vendors…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[160px]"><ArrowUpDown className="size-3.5 text-muted-foreground" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="category">Category (A-Z)</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{sorted.length} of {suppliers.length}</span>
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Vendor</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Contact Person</th>
              <th className="px-4 py-3 font-medium">Contact Number</th>
              <th className="px-4 py-3 font-medium">Email Address</th>
              <th className="px-4 py-3 font-medium">Website</th>
              <th className="px-4 py-3 font-medium">Notes</th>
              <th className="px-4 py-3 font-medium text-center">Recommended</th>
              <th className="px-4 py-3 font-medium">Edit</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((v) => (
              <tr key={v.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{v.vendorName}</td>
                <td className="px-4 py-3 text-muted-foreground">{v.vendorCategory}</td>
                <td className="px-4 py-3 text-muted-foreground">{v.primaryContact ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{v.phone ? <CopyableText value={v.phone} href={`tel:${v.phone}`} /> : "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{v.email ? <CopyableText value={v.email} href={`mailto:${v.email}`} /> : "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {v.website ? (
                    <a
                      href={v.website.startsWith("http") ? v.website : `https://${v.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {v.website}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
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
