import { MOCK_VENDORS } from "@/lib/data/mock/vendors";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function VendorsTable() {
  const sorted = [...MOCK_VENDORS].sort(
    (a, b) => b.performance.overallVendorScore - a.performance.overallVendorScore
  );

  return (
    <Card className="overflow-x-auto py-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="px-4 py-3 font-medium">Vendor</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Location</th>
            <th className="px-4 py-3 font-medium">Lead Time</th>
            <th className="px-4 py-3 font-medium">On-Time %</th>
            <th className="px-4 py-3 font-medium">Score</th>
            <th className="px-4 py-3 font-medium">Preferred</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((v) => (
            <tr key={v.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
              <td className="px-4 py-3 font-medium text-foreground">{v.vendorName}</td>
              <td className="px-4 py-3 text-muted-foreground">{v.vendorCategory}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {v.city}, {v.state}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{v.leadTimeDays}d</td>
              <td className="px-4 py-3 text-muted-foreground">
                {v.performance.onTimeDeliveryPercent}%
              </td>
              <td className="px-4 py-3">
                <Badge
                  className={
                    v.performance.overallVendorScore >= 90
                      ? "bg-success-soft text-success border-transparent"
                      : v.performance.overallVendorScore >= 75
                      ? "bg-info-soft text-info-foreground border-transparent"
                      : "bg-warning-soft text-warning-foreground border-transparent"
                  }
                >
                  {v.performance.overallVendorScore}
                </Badge>
              </td>
              <td className="px-4 py-3">
                {v.isPreferredVendor && (
                  <Badge className="bg-primary-soft text-primary border-transparent">
                    Preferred
                  </Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
