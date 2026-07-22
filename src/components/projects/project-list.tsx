"use client";

import * as React from "react";
import Link from "next/link";
import { Search, ArrowUpDown, Printer } from "lucide-react";

import { useProjects } from "@/hooks/use-projects";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { openPrintWindow, escapeHtml } from "@/lib/estimating/print-window";
import type { Project, ProjectCalculatedStatus } from "@/types";

/**
 * Custom status ordering for the "Status" sort option — per the user's
 * request: Active first, then Planning, then On Hold, then Completed last.
 * Statuses not explicitly called out (delayed, substantially_complete,
 * archived) are slotted in near their closest conceptual neighbor.
 */
const STATUS_SORT_ORDER: Record<ProjectCalculatedStatus, number> = {
  active: 0,
  delayed: 1,
  planning: 2,
  on_hold: 3,
  substantially_complete: 4,
  closed: 5,
  archived: 6,
};

type SortOption = "status" | "property_az" | "budget_desc";

function sortProjects(projects: Project[], sortBy: SortOption): Project[] {
  const copy = [...projects];
  switch (sortBy) {
    case "status":
      return copy.sort(
        (a, b) => STATUS_SORT_ORDER[a.calculatedStatus] - STATUS_SORT_ORDER[b.calculatedStatus]
      );
    case "property_az":
      return copy.sort((a, b) => a.address.street.localeCompare(b.address.street));
    case "budget_desc":
      return copy.sort((a, b) => (b.approvedBudget || 0) - (a.approvedBudget || 0));
    default:
      return copy;
  }
}

function formatCurrency(n: number) {
  if (!n) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function statusLabel(status: ProjectCalculatedStatus) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ProjectList() {
  const projects = useProjects();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<ProjectCalculatedStatus | "all">("all");
  const [sortBy, setSortBy] = React.useState<SortOption | "none">("status");

  const filtered = projects.filter((p) => {
    const matchesSearch = p.projectName.toLowerCase().includes(search.toLowerCase()) ||
      p.address.street.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.calculatedStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sorted = sortBy === "none" ? filtered : sortProjects(filtered, sortBy);

  function handlePrint() {
    const rows = sorted
      .map(
        (p) => `
        <tr>
          <td>${escapeHtml(p.projectName)}</td>
          <td>${escapeHtml(p.address.street)}</td>
          <td>${statusLabel(p.calculatedStatus)}</td>
          <td>${p.completionPercent}%</td>
          <td class="right">${formatCurrency(p.approvedBudget)}</td>
          <td>${formatDate(p.plannedCompletionDate)}</td>
          <td>${escapeHtml(p.notes ?? "")}</td>
        </tr>`
      )
      .join("");

    openPrintWindow(
      "Projects",
      `
      <div class="header">
        <h1>Nice &amp; Weird Group</h1>
        <p>Projects — ${sorted.length} of ${projects.length}</p>
        <p>Printed ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
      </div>
      <table>
        <thead><tr><th>Project</th><th>Location</th><th>Status</th><th>% Complete</th><th class="right">Budget</th><th>Target Completion</th><th>Notes</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      `
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects or locations..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption | "none")}>
          <SelectTrigger>
            <ArrowUpDown className="size-3.5 text-muted-foreground" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Default Order</SelectItem>
            <SelectItem value="status">Status (Active → Completed)</SelectItem>
            <SelectItem value="property_az">Property (A–Z)</SelectItem>
            <SelectItem value="budget_desc">Budget (Highest → Lowest)</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto text-sm text-muted-foreground">
          {filtered.length} of {projects.length} projects
        </span>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="size-3.5" /> Print
        </Button>
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">% Complete</th>
              <th className="px-4 py-3 font-medium">Budget</th>
              <th className="px-4 py-3 font-medium">Target Completion</th>
              <th className="px-4 py-3 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr key={p.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3">
                  <Link
                    href={`/projects/${p.id}`}
                    className="font-medium text-foreground hover:text-primary hover:underline"
                  >
                    {p.projectName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.address.street}</td>
                <td className="px-4 py-3">
                  <ProjectStatusBadge status={p.calculatedStatus} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.completionPercent}%</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatCurrency(p.approvedBudget)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(p.plannedCompletionDate)}
                </td>
                <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate" title={p.notes}>
                  {p.notes || "—"}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  No projects match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
