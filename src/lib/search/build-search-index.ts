import type { Project } from "@/types/project";
import type { Property } from "@/types/maintenance";
import type { ProjectDocument, Drawing } from "@/types/documents";
import type { Contact } from "@/types/contacts";
import type { Estimate } from "@/types/estimating";

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  category: "Project" | "Property" | "Document" | "Drawing" | "Contact" | "Estimate";
  href: string;
}

/**
 * Builds one flat, searchable list across the modules people look things
 * up in most — Projects, Properties, Documents, Drawings, Contacts,
 * Estimates. Pass in live data from hooks so results always reflect
 * anything just added, not a stale snapshot.
 */
export function buildSearchIndex(
  projects: Project[],
  properties: Property[],
  documents: ProjectDocument[],
  drawings: Drawing[],
  contacts: Contact[],
  estimates: Estimate[]
): SearchResultItem[] {
  const items: SearchResultItem[] = [];

  for (const p of projects) {
    items.push({
      id: p.id,
      title: p.projectName,
      subtitle: `${p.address.street}, ${p.address.city}`,
      category: "Project",
      href: `/projects/${p.id}`,
    });
  }

  for (const p of properties) {
    items.push({
      id: p.id,
      title: p.name,
      subtitle: p.address ?? p.town,
      category: "Property",
      href: `/properties?propertyId=${p.id}`,
    });
  }

  for (const d of documents) {
    items.push({
      id: d.id,
      title: d.title,
      subtitle: d.documentNumber,
      category: "Document",
      href: `/documents?tab=documents`,
    });
  }

  for (const d of drawings) {
    items.push({
      id: d.id,
      title: `${d.drawingNumber} — ${d.drawingTitle}`,
      category: "Drawing",
      href: `/documents?tab=drawings`,
    });
  }

  for (const c of contacts) {
    items.push({
      id: c.id,
      title: c.name,
      subtitle: c.company ?? c.role,
      category: "Contact",
      href: `/contacts`,
    });
  }

  for (const e of estimates) {
    const project = projects.find((p) => p.id === e.projectId);
    items.push({
      id: e.id,
      title: `${e.estimateNumber} — ${project?.projectName ?? ""}`,
      subtitle: e.estimateStatus.replace(/_/g, " "),
      category: "Estimate",
      href: `/estimating?tab=estimates`,
    });
  }

  return items;
}

export function searchItems(index: SearchResultItem[], query: string, limit = 8): SearchResultItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return index
    .filter((item) => item.title.toLowerCase().includes(q) || item.subtitle?.toLowerCase().includes(q))
    .slice(0, limit);
}
