import { MOCK_PURCHASE_ORDERS } from "@/lib/data/mock/purchase-orders";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { MOCK_VENDORS } from "@/lib/data/mock/vendors";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STATUS_CLASS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_approval: "bg-warning-soft text-warning-foreground",
  approved: "bg-info-soft text-info-foreground",
  issued: "bg-primary-soft text-primary",
  acknowledged: "bg-primary-soft text-primary",
  partially_delivered: "bg-warning-soft text-warning-foreground",
  delivered: "bg-success-soft text-success",
  closed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive-soft text-destructive",
};

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function PurchaseOrdersTable() {
  const sorted = [...MOCK_PURCHASE_ORDERS].sort(
    (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
  );

  return (
    <Card className="overflow-x-auto py-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="px-4 py-3 font-medium">PO Number</th>
            <th className="px-4 py-3 font-medium">Project</th>
            <th className="px-4 py-3 font-medium">Vendor</th>
            <th className="px-4 py-3 font-medium">Description</th>
            <th className="px-4 py-3 font-medium">Order Date</th>
            <th className="px-4 py-3 font-medium">Total</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((po) => {
            const project = MOCK_PROJECTS.find((p) => p.id === po.projectId);
            const vendor = MOCK_VENDORS.find((v) => v.id === po.vendorId);
            return (
              <tr key={po.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{po.poNumber}</td>
                <td className="px-4 py-3 text-muted-foreground">{project?.projectName ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{vendor?.vendorName ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {po.lineItems[0]?.description}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(po.orderDate)}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatCurrency(po.total)}</td>
                <td className="px-4 py-3">
                  <Badge className={`${STATUS_CLASS[po.poStatus] ?? ""} border-transparent`}>
                    {po.poStatus.replace(/_/g, " ")}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
