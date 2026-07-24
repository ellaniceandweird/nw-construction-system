"use client";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { useProperties } from "@/hooks/use-properties";
import { useMaintenanceTasks } from "@/hooks/use-maintenance-tasks";
import { useProjects } from "@/hooks/use-projects";
import { getRelatedProjects, getMaintenanceHistory } from "@/lib/properties/property-relations";
import { useEquipmentMaintenance } from "@/hooks/use-equipment-maintenance";
import { useMaintenanceLog } from "@/hooks/use-maintenance-log";
import { PropertyCard } from "@/components/properties/property-card";
import { PropertyDetailDialog } from "@/components/properties/property-detail-dialog";
import { recordRecentlyViewed } from "@/lib/search/recently-viewed-store";

export function PropertiesPageClient() {
  const projects = useProjects();
  const properties = useProperties();
  const tasks = useMaintenanceTasks();
  const schedules = useEquipmentMaintenance();
  const logEntries = useMaintenanceLog();
  const searchParams = useSearchParams();
  const [search, setSearch] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const selectedProperty = properties.find((p) => p.id === selectedId) ?? null;

  React.useEffect(() => {
    const propertyId = searchParams.get("propertyId");
    if (propertyId) setSelectedId(propertyId);
  }, [searchParams]);

  React.useEffect(() => {
    if (selectedProperty) {
      recordRecentlyViewed({ title: selectedProperty.name, href: `/properties?propertyId=${selectedProperty.id}`, category: "Property" });
    }
  }, [selectedProperty]);

  const filtered = properties.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <PageHeader
        title="Property Profiles"
        description="Every property Nice & Weird operates — cover photo, related construction projects, and maintenance history in one place."
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-8" placeholder="Search properties…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {sorted.map((property) => {
          const projectCount = getRelatedProjects(property, projects).length;
          const history = getMaintenanceHistory(property, tasks, schedules, logEntries);
          const openTaskCount = history.tasks.filter((t) => t.taskStatus !== "complete").length;
          return (
            <PropertyCard
              key={property.id}
              property={property}
              projectCount={projectCount}
              openTaskCount={openTaskCount}
              onClick={() => setSelectedId(property.id)}
            />
          );
        })}
      </div>

      {sorted.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">No properties match your search.</p>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        Related Projects are matched automatically by name/address, not manually linked —
        a few properties (like general upkeep buckets) won&apos;t have a matching
        construction project, which is expected. Set a cover photo per property using the
        same Google Drive picker as Documents.
      </p>

      <PropertyDetailDialog property={selectedProperty} open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)} />
    </>
  );
}
