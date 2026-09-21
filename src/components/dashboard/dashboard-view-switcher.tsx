"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects } from "@/hooks/use-projects";
import { useProperties } from "@/hooks/use-properties";
import { getPropertyDisplayName } from "@/lib/properties/property-relations";

export type DashboardView = "executive" | "financial" | "maintenance" | "procurement" | "planning";

export const DASHBOARD_VIEW_LABELS: Record<DashboardView, string> = {
  executive: "Executive overview",
  financial: "Financial dashboard",
  maintenance: "Maintenance dashboard",
  procurement: "Procurement dashboard",
  planning: "Planning dashboard",
};

interface Props {
  view: DashboardView;
  onViewChange: (view: DashboardView) => void;
  projectFilter: string;
  onProjectFilterChange: (projectId: string) => void;
  propertyFilter: string;
  onPropertyFilterChange: (propertyId: string) => void;
  showProjectFilter?: boolean;
  showPropertyFilter?: boolean;
}

export function DashboardViewSwitcher({
  view,
  onViewChange,
  projectFilter,
  onProjectFilterChange,
  propertyFilter,
  onPropertyFilterChange,
  showProjectFilter = true,
  showPropertyFilter = true,
}: Props) {
  const projects = useProjects();
  const properties = useProperties();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {showPropertyFilter && (
        <Select value={propertyFilter} onValueChange={onPropertyFilterChange}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All properties" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All properties</SelectItem>
            {properties.map((p) => (<SelectItem key={p.id} value={p.id}>{getPropertyDisplayName(p)}</SelectItem>))}
          </SelectContent>
        </Select>
      )}
      {showProjectFilter && (
        <Select value={projectFilter} onValueChange={onProjectFilterChange}>
          <SelectTrigger className="w-56"><SelectValue placeholder="All projects" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>))}
          </SelectContent>
        </Select>
      )}
      <Select value={view} onValueChange={(v) => onViewChange(v as DashboardView)}>
        <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
        <SelectContent>
          {(Object.keys(DASHBOARD_VIEW_LABELS) as DashboardView[]).map((key) => (
            <SelectItem key={key} value={key}>{DASHBOARD_VIEW_LABELS[key]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
