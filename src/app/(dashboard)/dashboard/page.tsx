"use client";

import {
  CalendarClock,
  Wallet,
  ClipboardCheck,
  Wrench,
  CalendarCheck2,
  ShoppingCart,
  Printer,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/widgets/kpi-card";
import { ProjectsOverviewWidget } from "@/components/dashboard/widgets/projects-overview-widget";
import { BudgetOverviewWidget } from "@/components/dashboard/widgets/budget-overview-widget";
import { RecentActivityWidget } from "@/components/dashboard/widgets/recent-activity-widget";
import { UpcomingDeadlinesWidget } from "@/components/dashboard/widgets/upcoming-deadlines-widget";
import { NotesFromManagementWidget } from "@/components/dashboard/widgets/notes-from-management-widget";
import { StatusLegend } from "@/components/dashboard/widgets/status-legend";
import { printExecutiveSummary } from "@/lib/dashboard/print-executive-summary";
import {
  getProjectsBehindSchedule,
  getProjectsOverBudget,
  getPendingApprovals,
  getOverdueMaintenance,
  getMaintenanceDueThisWeek,
  getProcurementRequiringAttention,
  getBudgetOverview,
  getUpcomingWorkNext2Weeks,
} from "@/lib/dashboard/metrics";

export default function DashboardPage() {
  const behindSchedule = getProjectsBehindSchedule();
  const overBudget = getProjectsOverBudget();
  const pendingApprovals = getPendingApprovals();
  const overdueMaintenance = getOverdueMaintenance();
  const dueThisWeek = getMaintenanceDueThisWeek();
  const procurementAttention = getProcurementRequiringAttention();

  function handlePrintExecutiveSummary() {
    const { totalBudget, actualCost, remaining, percentUsed } = getBudgetOverview();
    printExecutiveSummary({
      totalBudget,
      actualCost,
      remaining,
      percentUsed,
      behindSchedule,
      overBudget,
      pendingApprovalsCount: pendingApprovals.length,
      upcomingWork: getUpcomingWorkNext2Weeks(),
    });
  }

  return (
    <>
      <PageHeader
        title="Dashboard (Executive Overview)"
        description="Role-aware operational overview — updates automatically as project data changes."
        actions={
          <Button variant="outline" size="sm" onClick={handlePrintExecutiveSummary}>
            <Printer className="size-3.5" /> Print Executive Summary
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <KpiCard
          label="Projects Behind Schedule"
          value={behindSchedule.length}
          icon={CalendarClock}
          tone="destructive"
          href="/projects"
        />
        <KpiCard
          label="Projects Over Budget"
          value={overBudget.length}
          icon={Wallet}
          tone="destructive"
          href="/projects"
        />
        <KpiCard
          label="Pending Approvals"
          value={pendingApprovals.length}
          icon={ClipboardCheck}
          tone="warning"
          href="/maintenance"
        />
        <KpiCard
          label="Overdue Maintenance"
          value={overdueMaintenance.length}
          icon={Wrench}
          tone="destructive"
          href="/maintenance"
        />
        <KpiCard
          label="Maintenance Due This Week"
          value={dueThisWeek.length}
          icon={CalendarCheck2}
          tone="success"
          href="/maintenance"
        />
        <KpiCard
          label="Procurement Requiring Attention"
          value={procurementAttention.length}
          icon={ShoppingCart}
          tone="info"
          href="/procurement"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ProjectsOverviewWidget />
        <BudgetOverviewWidget />
        <RecentActivityWidget />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <UpcomingDeadlinesWidget />
        <NotesFromManagementWidget />
      </div>

      <StatusLegend />
    </>
  );
}
