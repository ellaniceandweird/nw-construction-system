"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { DashboardViewSwitcher, DASHBOARD_VIEW_LABELS, type DashboardView } from "@/components/dashboard/dashboard-view-switcher";
import { ExecutiveOverviewDashboard } from "@/components/dashboard/views/executive-overview-dashboard";

const VALID_VIEWS: DashboardView[] = ["executive", "financial", "maintenance", "procurement", "planning"];

export function DashboardPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const viewParam = searchParams.get("view");
  const view = (VALID_VIEWS.includes(viewParam as DashboardView) ? viewParam : "executive") as DashboardView;

  const [projectFilter, setProjectFilter] = React.useState("all");
  const [propertyFilter, setPropertyFilter] = React.useState("all");

  function handleViewChange(next: DashboardView) {
    router.push(`${pathname}?view=${next}`, { scroll: false });
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`${DASHBOARD_VIEW_LABELS[view]} — updates automatically as project data changes.`}
        actions={
          <DashboardViewSwitcher
            view={view}
            onViewChange={handleViewChange}
            projectFilter={projectFilter}
            onProjectFilterChange={setProjectFilter}
            propertyFilter={propertyFilter}
            onPropertyFilterChange={setPropertyFilter}
            showProjectFilter={view !== "maintenance"}
            showPropertyFilter={view === "maintenance"}
          />
        }
      />

      {view === "executive" && <ExecutiveOverviewDashboard projectFilter={projectFilter} />}
      {view === "financial" && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
          Financial dashboard — coming soon.
        </div>
      )}
      {view === "maintenance" && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
          Maintenance dashboard — coming soon.
        </div>
      )}
      {view === "procurement" && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
          Procurement dashboard — coming soon.
        </div>
      )}
      {view === "planning" && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
          Planning dashboard — coming soon.
        </div>
      )}
    </>
  );
}
