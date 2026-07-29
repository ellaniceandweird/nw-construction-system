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
import { BudgetVsActualChart } from "@/components/dashboard/widgets/budget-vs-actual-chart";
import { RecentActivityWidget } from "@/components/dashboard/widgets/recent-activity-widget";
import { UpcomingDeadlinesWidget } from "@/components/dashboard/widgets/upcoming-deadlines-widget";
import { NotesFromManagementWidget } from "@/components/dashboard/widgets/notes-from-management-widget";
import { StatusLegend } from "@/components/dashboard/widgets/status-legend";
import { printExecutiveSummary } from "@/lib/dashboard/print-executive-summary";
import { useProjects } from "@/hooks/use-projects";
import { useActivities } from "@/hooks/use-activities";
import { useMaintenanceTasks } from "@/hooks/use-maintenance-tasks";
import { useApprovalRequests } from "@/hooks/use-approval-requests";
import {
  getProjectsBehindSchedule,
  getProjectsOverBudget,
  getOverdueMaintenance,
  getMaintenanceDueThisWeek,
  getProcurementRequiringAttention,
  getUpcomingWorkNext2Weeks,
} from "@/lib/dashboard/metrics";

export default function DashboardPage() {
  const projects = useProjects();
  const activities = useActivities();
  const maintenanceTasks = useMaintenanceTasks();
  const approvalRequests = useApprovalRequests();

  const behindSchedule = getProjectsBehindSchedule(projects, activities);
  const overBudget = getProjectsOverBudget(projects);
  const pendingApprovals = approvalRequests.filter((a) => a.approvalStatus === "pending");
  const overdueMaintenance = getOverdueMaintenance(maintenanceTasks);
  const dueThisWeek = getMaintenanceDueThisWeek(maintenanceTasks);
  const procurementAttention = getProcurementRequiringAttention(activities);

  function handlePrintExecutiveSummary() {
    printExecutiveSummary({
      allProjects: projects,
      behindSchedule,
      overBudget,
      pendingApprovalsCount: pendingApprovals.length,
      upcomingWork: getUpcomingWorkNext2Weeks(activities, projects),
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
          href="/approvals"
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
        <BudgetVsActualChart />
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
