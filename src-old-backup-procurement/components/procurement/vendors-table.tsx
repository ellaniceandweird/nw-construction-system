"use client";

import * as React from "react";
import { Pencil } from "lucide-react";

import { useVendors } from "@/hooks/use-vendors";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VendorEditDialog } from "@/components/procurement/vendor-edit-dialog";
import type { Vendor } from "@/types/procurement";

export function VendorsTable() {
  const vendors = useVendors();
  const [editingVendor, setEditingVendor] = React.useState<Vendor | null>(null);

  const sorted = [...vendors].sort((a, b) => a.vendorName.localeCompare(b.vendorName));

  return (
    <>
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
              <th className="px-4 py-3 font-medium">Edit</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((v) => (
              <tr key={v.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{v.vendorName}</td>
                <td className="px-4 py-3 text-muted-foreground">{v.vendorCategory}</td>
                <td className="px-4 py-3 text-muted-foreground">{v.primaryContact ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{v.phone ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{v.email ?? "—"}</td>
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
