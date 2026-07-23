"use client";

import * as React from "react";
import { Pencil, Plus, ArrowUpDown } from "lucide-react";

import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { useVendors } from "@/hooks/use-vendors";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PurchaseOrderEditDialog } from "@/components/procurement/purchase-order-edit-dialog";
import type { PurchaseOrder, PurchaseOrderStatus } from "@/types/procurement";

const STATUS_CLASS: Record<PurchaseOrderStatus, string> = {
  approved: "bg-info-soft text-info-foreground",
  paid: "bg-success-soft text-success",
  partially_delivered: "bg-warning-soft text-warning-foreground",
  delivered: "bg-success-soft text-success",
  cancelled: "bg-destructive-soft text-destructive",
};

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type SortOption = "date_desc" | "date_asc" | "total_desc" | "total_asc";

export function PurchaseOrdersTable() {
  const orders = usePurchaseOrders();
  const vendors = useVendors();
  const [editingOrder, setEditingOrder] = React.useState<PurchaseOrder | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<PurchaseOrderStatus | "all">("all");
  const [projectFilter, setProjectFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<SortOption>("date_desc");

  const filtered = orders.filter((po) => {
    const matchesStatus = statusFilter === "all" || po.poStatus === statusFilter;
    const matchesProject = projectFilter === "all" || po.projectId === projectFilter;
    return matchesStatus && matchesProject;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "date_asc":
        return new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
      case "total_desc":
        return b.total - a.total;
      case "total_asc":
        return a.total - b.total;
      default:
        return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
    }
  });

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="partially_delivered">Partially Delivered</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Projects" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {MOCK_PROJECTS.map((p) => (<SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-[180px]"><ArrowUpDown className="size-3.5 text-muted-foreground" /><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">Order Date (Newest)</SelectItem>
            <SelectItem value="date_asc">Order Date (Oldest)</SelectItem>
            <SelectItem value="total_desc">Total (Highest)</SelectItem>
            <SelectItem value="total_asc">Total (Lowest)</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{sorted.length} of {orders.length}</span>
        <Button size="sm" className="ml-auto" onClick={() => setCreating(true)}>
          <Plus className="size-3.5" /> Add Purchase Order
        </Button>
      </div>

      <p className="mb-3 text-xs text-muted-foreground">
        Most rows here auto-generate the moment a quote is marked Awarded on the Quotes
        tab — use &quot;Add Purchase Order&quot; only for orders placed outside that flow.
      </p>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">PO Number</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Vendor</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Order Date</th>
              <th className="px-4 py-3 font-medium">Delivery Date</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Notes</th>
              <th className="px-4 py-3 font-medium">Edit</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((po) => {
              const project = MOCK_PROJECTS.find((p) => p.id === po.projectId);
              const vendor = vendors.find((v) => v.id === po.vendorId);
              return (
                <tr key={po.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                  <td className="px-4 py-3 font-medium text-foreground">{po.poNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{project?.projectName ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{vendor?.vendorName ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {po.lineItems[0]?.description}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(po.orderDate)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(po.expectedDelivery)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatCurrency(po.total)}</td>
                  <td className="px-4 py-3">
                    <Badge className={`${STATUS_CLASS[po.poStatus] ?? ""} border-transparent`}>
                      {po.poStatus.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs">{po.notes ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" onClick={() => setEditingOrder(po)}>
                      <Pencil className="size-3.5" />
                    </Button>
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-6 text-center text-muted-foreground">No purchase orders match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <PurchaseOrderEditDialog
        order={editingOrder}
        open={!!editingOrder}
        onOpenChange={(open) => !open && setEditingOrder(null)}
      />
      <PurchaseOrderEditDialog
        order={null}
        createMode
        open={creating}
        onOpenChange={setCreating}
      />
    </>
  );
}
