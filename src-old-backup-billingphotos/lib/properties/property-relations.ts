import type { Property } from "@/types/maintenance";
import type { Project } from "@/types/project";
import type { MaintenanceTask, EquipmentMaintenanceSchedule } from "@/types/maintenance";
import type { MaintenanceLogEntry } from "@/lib/maintenance/maintenance-log-store";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/\bstreet\b/g, "st")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

/**
 * Matches a Property to construction Projects. There's no explicit link
 * for most of them (only relatedProjectId, rarely set), so this compares
 * normalized text against both the project's name and its street address
 * — e.g. Property "18 Cross St" matches Project address "18 Cross Street"
 * even with the street/st spelling difference.
 */
export function getRelatedProjects(property: Property, projects: Project[]): Project[] {
  const firstSegment = property.name.split("/")[0].split("(")[0].trim();
  const propKey = normalize(firstSegment).replace(/^the/, "");
  if (!propKey) return [];

  return projects.filter((p) => {
    if (property.relatedProjectId === p.id) return true;
    const nameKey = normalize(p.projectName);
    const streetKey = normalize(p.address.street);
    return (
      nameKey.includes(propKey) ||
      propKey.includes(nameKey) ||
      streetKey.includes(propKey) ||
      propKey.includes(streetKey)
    );
  });
}

export interface MaintenanceHistory {
  tasks: MaintenanceTask[];
  schedules: EquipmentMaintenanceSchedule[];
  logEntries: MaintenanceLogEntry[];
}

function matchesProperty(property: Property, propertyId?: string, propertyName?: string): boolean {
  if (propertyId) return propertyId === property.id;
  if (propertyName) return propertyName.toLowerCase() === property.name.toLowerCase();
  return false;
}

export function getMaintenanceHistory(
  property: Property,
  tasks: MaintenanceTask[],
  schedules: EquipmentMaintenanceSchedule[],
  logEntries: MaintenanceLogEntry[]
): MaintenanceHistory {
  return {
    tasks: tasks.filter((t) => matchesProperty(property, t.propertyId, t.propertyName)),
    schedules: schedules.filter((s) => matchesProperty(property, s.propertyId, s.propertyName)),
    logEntries: logEntries.filter((l) => matchesProperty(property, undefined, l.propertyName)),
  };
}
