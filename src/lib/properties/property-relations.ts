import type { Property } from "@/types/maintenance";
import type { Project } from "@/types/project";
import type { MaintenanceTask, EquipmentMaintenanceSchedule } from "@/types/maintenance";
import type { MaintenanceLogEntry } from "@/lib/maintenance/maintenance-log-store";
import type { FieldPhoto } from "@/types/field-operations";

/**
 * The label to show anywhere a property needs a human-readable name —
 * combines address and business/purpose name, e.g. "391 Main St - Cidery".
 * Falls back to whichever of the two is actually set.
 */
export function getPropertyDisplayName(property: Pick<Property, "address" | "name">): string {
  if (property.address && property.name) return `${property.address} - ${property.name}`;
  return property.address || property.name || "Unnamed Property";
}

/** Just the property's name, no address — falls back to the address only for a property that has no name at all. */
export function getPropertyShortName(property: Pick<Property, "address" | "name">): string {
  return property.name?.trim() || property.address || "Unnamed Property";
}

/**
 * Maps whatever property text is stored on a record back to the property's
 * short name. Records saved from the old dropdown carry the long
 * "address - name" text (and some carry just the address), so those are
 * recognized and mapped to the same short name; anything that doesn't
 * match a known property — a hand-typed name, say — is returned untouched.
 */
export function resolvePropertyShortName(
  stored: string | undefined | null,
  properties: Pick<Property, "address" | "name">[]
): string {
  const value = (stored ?? "").trim();
  if (!value) return "";
  const key = value.toLowerCase();
  for (const p of properties) {
    const candidates = [getPropertyShortName(p), getPropertyDisplayName(p), p.address];
    if (candidates.some((c) => c && c.trim().toLowerCase() === key)) return getPropertyShortName(p);
  }
  return value;
}

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
  const firstSegment = (property.name ?? property.address).split("/")[0].split("(")[0].trim();
  const propKey = normalize(firstSegment).replace(/^the/, "");

  return projects.filter((p) => {
    // Direct ID links are the most reliable match — check these first,
    // regardless of whether the fuzzy text keys below would even work.
    if (property.relatedProjectId === p.id) return true;
    if (p.propertyId === property.id) return true;
    if (!propKey) return false;
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
  if (propertyName) return propertyName.toLowerCase() === getPropertyDisplayName(property).toLowerCase();
  return false;
}

export function getPropertyForBillingEntity(billingEntityId: string | undefined, properties: Property[]): Property | undefined {
  if (!billingEntityId) return undefined;
  return properties.find((p) => p.billingEntityId === billingEntityId);
}

/**
 * Reverse of getRelatedProjects — given a construction Project, finds its
 * matching Property and returns that property's billing entity, if any.
 * Used to auto-populate Billing Entity on Purchase Orders and Field
 * Worker Invoices from the project alone, since a property's billing
 * entity is the closest thing to a canonical "who gets billed" answer.
 */
/**
 * Given a construction Project, finds its matching Property directly —
 * used to auto-populate the Property field the moment a Project is
 * picked, across Daily Logs, Documents, Drawings, and Photos, so nobody
 * has to pick both by hand.
 */
export function getPropertyForProject(project: Project, properties: Property[]): Property | undefined {
  return properties.find((property) => getRelatedProjects(property, [project]).length > 0);
}

export function getBillingEntityIdForProject(project: Project, properties: Property[]): string | undefined {
  for (const property of properties) {
    if (getRelatedProjects(property, [project]).length > 0 && property.billingEntityId) {
      return property.billingEntityId;
    }
  }
  return undefined;
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

/**
 * Photos live in the Documents module, keyed to a construction project's
 * ID — not directly to a Property. This aggregates photos across every
 * related project so a property with multiple project phases shows all
 * of them together.
 */
export function getPropertyPhotos(relatedProjects: Project[], allPhotos: FieldPhoto[]): FieldPhoto[] {
  const projectIds = new Set(relatedProjects.map((p) => p.id));
  return allPhotos.filter((photo) => projectIds.has(photo.projectId));
}
