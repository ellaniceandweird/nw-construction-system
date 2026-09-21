"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PastelStatCard } from "@/components/dashboard/widgets/pastel-stat-card";
import { PastelBarChart } from "@/components/dashboard/widgets/pastel-bar-chart";
import { PastelDonutChart } from "@/components/dashboard/widgets/pastel-donut-chart";
import { NeedsAttentionTable, type AttentionItem } from "@/components/dashboard/widgets/needs-attention-table";
import { DASHBOARD_COLORS } from "@/lib/dashboard/pastel-colors";
import { useProjects } from "@/hooks/use-projects";
import { useActivities } from "@/hooks/use-activities";
import { useMaintenanceTasks } from "@/hooks/use-maintenance-tasks";
import { useMaterialRequests } from "@/hooks/use-material-requests";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { getEffectiveCompletionPercent } from "@/lib/scheduling/compute-project-completion";
import { getProjectsBehindSchedule, getProjectsOverBudget, getOverdueMaintenance } from "@/lib/dashboard/metrics";
import { openPrintWindow } from "@/lib/estimating/print-window";

interface Props {
  projectFilter: string;
}

function currency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function ExecutiveOverviewDashboard({ projectFilter }: Props) {
  const allProjects = useProjects();
  const activities = useActivities();
  const maintenanceTasks = useMaintenanceTasks();
  const materialRequests = useMaterialRequests();
  const purchaseOrders = usePurchaseOrders();

  const projects = projectFilter === "all" ? allProjects : allProjects.filter((p) => p.id === projectFilter);
  const activeProjects = projects.filter((p) => p.calculatedStatus === "active");

  const behindSchedule = getProjectsBehindSchedule(projects, activities);
  const overBudget = getProjectsOverBudget(projects);
  const overdueMaintenance = getOverdueMaintenance(maintenanceTasks);
  const pendingApprovalRequests = materialRequests.filter((m) => m.requestStatus === "for_approval");
  const latePOs = purchaseOrders.filter((po) => po.poStatus !== "delivered" && po.poStatus !== "cancelled" && po.expectedDelivery && new Date(po.expectedDelivery) < new Date());

  const totalBudget = activeProjects.reduce((sum, p) => sum + p.approvedBudget, 0);
  const totalSpent = activeProjects.reduce((sum, p) => sum + (p.actualCostToDate ?? 0), 0);
  const spentPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const onSchedule = activeProjects.length - behindSchedule.length;

  const budgetChartData = activeProjects.slice(0, 8).map((p) => ({
    name: p.projectName.length > 14 ? p.projectName.slice(0, 13) + "…" : p.projectName,
    Budget: p.approvedBudget,
    Actual: p.actualCostToDate ?? 0,
  }));

  const statusDonutData = [
    { label: "On track", value: Math.max(0, activeProjects.length - behindSchedule.length - overBudget.length), color: DASHBOARD_COLORS.good.fill },
    { label: "Needs attention", value: behindSchedule.length, color: DASHBOARD_COLORS.attention.fill },
    { label: "Critical", value: overBudget.length, color: DASHBOARD_COLORS.critical.fill },
  ];

  const attentionItems: AttentionItem[] = [
    ...overBudget.map((p) => ({
      id: `budget-${p.id}`,
      label: p.projectName,
      detail: `${currency(p.actualCostToDate ?? 0)} spent of ${currency(p.approvedBudget)} budget`,
      tone: "critical" as const,
      statusLabel: "Over budget",
      href: `/projects/${p.id}`,
    })),
    ...behindSchedule.map((p) => ({
      id: `sched-${p.id}`,
      label: p.projectName,
      detail: `${getEffectiveCompletionPercent(p, activities)}% complete, past target completion date`,
      tone: "attention" as const,
      statusLabel: "Behind schedule",
      href: `/projects/${p.id}`,
    })),
    ...pendingApprovalRequests.slice(0, 3).map((m) => ({
      id: `mr-${m.id}`,
      label: m.mrNumber,
      detail: "Material request awaiting approval",
      tone: "attention" as const,
      statusLabel: "Pending approval",
      href: "/procurement",
    })),
    ...overdueMaintenance.slice(0, 3).map((t) => ({
      id: `maint-${t.id}`,
      label: t.taskDescription,
      detail: t.propertyName ?? "—",
      tone: "critical" as const,
      statusLabel: "Overdue",
      href: "/maintenance",
    })),
    ...latePOs.slice(0, 3).map((po) => ({
      id: `po-${po.id}`,
      label: po.poNumber,
      detail: "Purchase order past expected delivery",
      tone: "attention" as const,
      statusLabel: "Past due",
      href: "/procurement",
    })),
  ];

  function handlePrint() {
    const rows = budgetChartData
      .map((d) => `<tr><td>${d.name}</td><td class="right">${currency(d.Budget)}</td><td class="right">${currency(d.Actual)}</td></tr>`)
      .join("");
    const attentionRows = attentionItems
      .map((a) => `<tr><td>${a.label}</td><td>${a.detail}</td><td class="right">${a.statusLabel}</td></tr>`)
      .join("");
    openPrintWindow(
      "Executive Overview",
      `
      <div class="header"><h1>Executive Overview</h1></div>
      <p>Active projects: ${activeProjects.length} - On schedule: ${onSchedule} - Spent of budget: ${spentPercent}%</p>
      <h3>Budget vs actual by project</h3>
      <table><thead><tr><th>Project</th><th class="right">Budget</th><th class="right">Actual</th></tr></thead><tbody>${rows}</tbody></table>
      <h3>Needs attention</h3>
      <table><thead><tr><th>Item</th><th>Detail</th><th class="right">Status</th></tr></thead><tbody>${attentionRows || "<tr><td colspan=3>Nothing needs attention right now.</td></tr>"}</tbody></table>
      `
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="size-3.5" /> Print
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <PastelStatCard label="Active projects" value={activeProjects.length} tone="info" href="/projects" />
        <PastelStatCard label="On schedule" value={`${onSchedule} of ${activeProjects.length}`} tone="good" />
        <PastelStatCard label="Spent of budget" value={`${spentPercent}%`} tone="attention" href="/financial" />
        <PastelStatCard label="Needs attention" value={attentionItems.length} tone="critical" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-base font-medium">Budget vs actual by project</h3>
          {budgetChartData.length > 0 ? (
            <PastelBarChart
              data={budgetChartData}
              categoryKey="name"
              series={[
                { key: "Budget", color: DASHBOARD_COLORS.info.fill, label: "Budget" },
                { key: "Actual", color: DASHBOARD_COLORS.good.fill, label: "Actual" },
              ]}
              valueFormatter={(v) => `$${Math.round(v / 1000)}K`}
            />
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">No active projects with a budget set.</p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-base font-medium">Project status</h3>
          <PastelDonutChart data={statusDonutData} />
        </div>
      </div>

      <NeedsAttentionTable items={attentionItems} />
    </div>
  );
}
