"use client";
import * as React from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { useProperties } from "@/hooks/use-properties";
import { useBillingEntities } from "@/hooks/use-billing-entities";
import { updateProperty } from "@/lib/properties/property-store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Reference view: which billing entity (LLC) each property bills
 * through, per the Company Billing & Entity List and the Catskill/
 * Hudson property maps. This reads from Properties (the source of
 * truth for property <-> billing entity), not a separate list — so it
 * always reflects reality instead of drifting out of sync.
 */
export function BillingEntitiesTable() {
  const properties = useProperties();
  const billingEntities = useBillingEntities();
  const [search, setSearch] = React.useState("");
  const [entityFilter, setEntityFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<"property" | "entity">("property");

  function entityName(id?: string) {
    if (!id) return undefined;
    return billingEntities.find((b) => b.id === id)?.companyName;
  }

  function handleEntityChange(propertyId: string, billingEntityId: string) {
    const property = properties.find((p) => p.id === propertyId);
    if (!property) return;
    updateProperty(propertyId, { billingEntityId });
  }

  const filtered = properties.filter((p) => {
    const matchesEntity = entityFilter === "all" || p.billingEntityId === entityFilter;
    if (!matchesEntity) return false;
    if (!search) return true;
    const haystack = `${p.name} ${p.address ?? ""} ${entityName(p.billingEntityId) ?? ""}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const sorted = [...filtered].sort((a, b) =>
    sortBy === "entity"
      ? (entityName(a.billingEntityId) ?? "").localeCompare(entityName(b.billingEntityId) ?? "")
      : a.name.localeCompare(b.name)
  );

  return (
    <>
      <p className="mb-3 text-xs text-muted-foreground">
        Which of your company's billing entities (LLCs) each property runs through — per the
        Company Billing &amp; Entity List and property maps. Change the billing entity here if a
        property moves between entities; it updates everywhere that property is used.
      </p>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[12rem]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search property, address, entity…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="All Billing Entities" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Billing Entities</SelectItem>
            {billingEntities.map((b) => (<SelectItem key={b.id} value={b.id}>{b.companyName}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[170px]"><ArrowUpDown className="size-3.5 text-muted-foreground" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="property">Property (A-Z)</SelectItem>
            <SelectItem value="entity">Billing Entity (A-Z)</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{sorted.length} of {properties.length}</span>
      </div>

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Address</th>
              <th className="px-4 py-3 font-medium">Billing Entity</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr key={p.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.address ?? "—"}</td>
                <td className="px-4 py-3">
                  <Select value={p.billingEntityId ?? ""} onValueChange={(v) => handleEntityChange(p.id, v)}>
                    <SelectTrigger className="w-[220px]"><SelectValue placeholder="Select billing entity" /></SelectTrigger>
                    <SelectContent>
                      {billingEntities.map((b) => (<SelectItem key={b.id} value={b.id}>{b.companyName}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-muted-foreground">
                  No properties match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}
