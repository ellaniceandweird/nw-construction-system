"use client";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Search, ArrowUpDown, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProperties } from "@/hooks/use-properties";
import { useMaintenanceTasks } from "@/hooks/use-maintenance-tasks";
import { useProjects } from "@/hooks/use-projects";
import { useBillingEntities } from "@/hooks/use-billing-entities";
import { getRelatedProjects, getMaintenanceHistory, getPropertyDisplayName } from "@/lib/properties/property-relations";
import { useEquipmentMaintenance } from "@/hooks/use-equipment-maintenance";
import { useMaintenanceLog } from "@/hooks/use-maintenance-log";
import { PropertyCard } from "@/components/properties/property-card";
import { PropertyDetailDialog } from "@/components/properties/property-detail-dialog";
import { PropertyCreateDialog } from "@/components/properties/property-create-dialog";
import { recordRecentlyViewed } from "@/lib/search/recently-viewed-store";

type SortOption = "address" | "name" | "town" | "billingEntity";

export function PropertiesPageClient() {
  const projects = useProjects();
  const properties = useProperties();
  const tasks = useMaintenanceTasks();
  const schedules = useEquipmentMaintenance();
  const logEntries = useMaintenanceLog();
  const billingEntities = useBillingEntities();
  const searchParams = useSearchParams();
  const [search, setSearch] = React.useState("");
  const [townFilter, setTownFilter] = React.useState("all");
  const [billingEntityFilter, setBillingEntityFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<SortOption>("address");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const selectedProperty = properties.find((p) => p.id === selectedId) ?? null;

  React.useEffect(() => {
    const propertyId = searchParams.get("propertyId");
    if (propertyId) setSelectedId(propertyId);
  }, [searchParams]);

  React.useEffect(() => {
    if (selectedProperty) {
      recordRecentlyViewed({ title: getPropertyDisplayName(selectedProperty), href: `/properties?propertyId=${selectedProperty.id}`, category: "Property" });
    }
  }, [selectedProperty]);

  function billingEntityName(id?: string) {
    if (!id) return undefined;
    return billingEntities.find((b) => b.id === id)?.companyName;
  }

  const towns = Array.from(new Set(properties.map((p) => p.town).filter((t): t is string => !!t))).sort();
  const usedBillingEntityIds = Array.from(new Set(properties.map((p) => p.billingEntityId).filter((id): id is string => !!id)));
  const usedBillingEntities = billingEntities
    .filter((b) => usedBillingEntityIds.includes(b.id))
    .sort((a, b) => a.companyName.localeCompare(b.companyName));

  const filtered = properties.filter((p) => {
    if (townFilter !== "all" && p.town !== townFilter) return false;
    if (billingEntityFilter !== "all" && p.billingEntityId !== billingEntityFilter) return false;
    if (!search) return true;
    const haystack = `${getPropertyDisplayName(p)} ${p.town ?? ""}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return (a.name ?? "").localeCompare(b.name ?? "");
      case "town":
        return (a.town ?? "").localeCompare(b.town ?? "");
      case "billingEntity":
        return (billingEntityName(a.billingEntityId) ?? "").localeCompare(billingEntityName(b.billingEntityId) ?? "");
      case "address":
      default:
        return a.address.localeCompare(b.address);
    }
  });

  return (
    <>
      <PageHeader
        title="Property Profiles"
        description="Every property Nice & Weird operates — cover photo, related construction projects, and maintenance history in one place."
      />

      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="size-3.5" /> New Property
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[14rem] flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search address, name, town…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={townFilter} onValueChange={setTownFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Towns" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Towns</SelectItem>
            {towns.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={billingEntityFilter} onValueChange={setBillingEntityFilter}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="All Billing Entities" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Billing Entities</SelectItem>
            {usedBillingEntities.map((b) => (<SelectItem key={b.id} value={b.id}>{b.companyName}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-[180px]"><ArrowUpDown className="size-3.5 text-muted-foreground" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="address">Address (A-Z)</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="town">Town (A-Z)</SelectItem>
            <SelectItem value="billingEntity">Billing Entity (A-Z)</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{sorted.length} of {properties.length}</span>
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
              billingEntityName={billingEntityName(property.billingEntityId)}
              projectCount={projectCount}
              openTaskCount={openTaskCount}
              onClick={() => setSelectedId(property.id)}
            />
          );
        })}
      </div>

      {sorted.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">No properties match your filters.</p>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        Related Projects are matched automatically by name/address, not manually linked —
        a few properties (like general upkeep buckets) won&apos;t have a matching
        construction project, which is expected. Set a cover photo per property using the
        same Google Drive picker as Documents.
      </p>

      <PropertyDetailDialog property={selectedProperty} open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)} />
      <PropertyCreateDialog open={creating} onOpenChange={setCreating} />
    </>
  );
}
