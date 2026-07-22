"use client";
import * as React from "react";
import { Pencil, Plus, Upload, Search, ArrowUpDown } from "lucide-react";
import { useBillingEntities } from "@/hooks/use-billing-entities";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BillingEntityEditDialog } from "@/components/financial/billing-entity-edit-dialog";
import { ImportBillingEntitiesDialog } from "@/components/financial/import-billing-entities-dialog";
import type { BillingEntity } from "@/types/financial";

export function BillingEntitiesTable() {
  const allEntities = useBillingEntities();
  const [editing, setEditing] = React.useState<BillingEntity | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"name" | "legal">("name");

  const filtered = allEntities.filter((e) =>
    !search || `${e.companyName} ${e.legalName ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );
  const entities = [...filtered].sort((a, b) =>
    sortBy === "name" ? a.companyName.localeCompare(b.companyName) : (a.legalName ?? "").localeCompare(b.legalName ?? "")
  );

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Your own company/property-holding entities used to pay vendor invoices —
          not customer accounts, since there are no external clients being billed.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="outline" onClick={() => setImporting(true)}><Upload className="size-3.5" /> Import</Button>
          <Button size="sm" onClick={() => setCreating(true)}><Plus className="size-3.5" /> New Entity</Button>
        </div>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[12rem]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search company or legal name…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[160px]"><ArrowUpDown className="size-3.5 text-muted-foreground" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Company (A-Z)</SelectItem>
            <SelectItem value="legal">Legal Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{entities.length} of {allEntities.length}</span>
      </div>
      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Company Name</th>
              <th className="px-4 py-3 font-medium">Legal Name</th>
              <th className="px-4 py-3 font-medium">Address</th>
              <th className="px-4 py-3 font-medium">Payment Terms</th>
              <th className="px-4 py-3 font-medium">Edit</th>
            </tr>
          </thead>
          <tbody>
            {entities.map((e) => (
              <tr key={e.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{e.companyName}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.legalName ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.address ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.defaultPaymentTerms ?? "—"}</td>
                <td className="px-4 py-3"><Button variant="ghost" size="icon" onClick={() => setEditing(e)}><Pencil className="size-3.5" /></Button></td>
              </tr>
            ))}
            {entities.length === 0 && (<tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">No entities yet — add one above.</td></tr>)}
          </tbody>
        </table>
      </Card>
      <BillingEntityEditDialog entity={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      <BillingEntityEditDialog entity={null} open={creating} onOpenChange={setCreating} />
      <ImportBillingEntitiesDialog open={importing} onOpenChange={setImporting} />
    </>
  );
}
