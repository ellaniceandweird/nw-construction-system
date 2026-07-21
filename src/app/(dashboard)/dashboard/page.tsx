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
import { openPrintWindow, escapeHtml } from "@/lib/estimating/print-window";
import {
  getProjectsBehindSchedule,
  getProjectsOverBudget,
  getPendingApprovals,
  getOverdueMaintenance,
  getMaintenanceDueThisWeek,
  getProcurementRequiringAttention,
  getBudgetOverview,
} from "@/lib/dashboard/metrics";

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function DashboardPage() {
  const behindSchedule = getProjectsBehindSchedule();
  const overBudget = getProjectsOverBudget();
  const pendingApprovals = getPendingApprovals();
  const overdueMaintenance = getOverdueMaintenance();
  const dueThisWeek = getMaintenanceDueThisWeek();
  const procurementAttention = getProcurementRequiringAttention();

  function handlePrintExecutiveSummary() {
    const { totalBudget, actualCost, remaining, percentUsed } = getBudgetOverview();

    const projectRows = (projects: typeof behindSchedule, reason: string) =>
      projects
        .map(
          (p) => `<tr><td>${escapeHtml(p.projectName)}</td><td>${escapeHtml(p.address.street)}</td><td>${reason}</td></tr>`
        )
        .join("");

    openPrintWindow(
      "Executive Summary",
      `
      <div class="header">
        <h1>Nice &amp; Weird Group</h1>
        <p>Executive Summary — Printed ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
      </div>

      <h2>Financial Snapshot</h2>
      <table>
        <tbody>
          <tr><td>Total Budget (all active projects)</td><td class="right">${formatCurrency(totalBudget)}</td></tr>
          <tr><td>Actual Cost to Date</td><td class="right">${formatCurrency(actualCost)}</td></tr>
          <tr><td>Remaining Budget</td><td class="right">${formatCurrency(remaining)}</td></tr>
          <tr class="total-row"><td>% of Budget Used</td><td class="right">${percentUsed}%</td></tr>
        </tbody>
      </table>

      <h2>Needs Your Attention</h2>
      <table>
        <thead><tr><th>Project</th><th>Location</th><th>Issue</th></tr></thead>
        <tbody>
          ${projectRows(behindSchedule, "Behind Schedule")}
          ${projectRows(overBudget, "Over Budget")}
        </tbody>
      </table>
      ${behindSchedule.length === 0 && overBudget.length === 0 ? "<p>Nothing flagged — every active project is on schedule and within budget.</p>" : ""}

      <h2>Pending Approvals</h2>
      <p>${pendingApprovals.length} item${pendingApprovals.length === 1 ? "" : "s"} awaiting action.</p>
      `
    );
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
