"use client";
import * as React from "react";
import Link from "next/link";
import { Pencil, Plus, Search, ArrowUpRight, Mail, Phone, Trash2 } from "lucide-react";
import { useContacts } from "@/hooks/use-contacts";
import { useProperties } from "@/hooks/use-properties";
import { useRowSelection } from "@/hooks/use-row-selection";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContactEditDialog } from "@/components/contacts/contact-edit-dialog";
import { CopyableText } from "@/components/shared/copyable-text";
import { deleteContact, restoreContact } from "@/lib/contacts/contact-store";
import { showUndoToast } from "@/lib/toast/toast-store";
import type { Contact, ContactCategory } from "@/types/contacts";

const ALL = "all";
const CATEGORY_LABELS: Record<ContactCategory, string> = {
  design_professional: "Design Professional",
  government_regulatory: "Government / Regulatory",
  service_provider: "Service Provider",
  internal_team: "Internal Team",
  other: "Other",
};
const CATEGORY_CLASS: Record<ContactCategory, string> = {
  design_professional: "bg-info-soft text-info-foreground",
  government_regulatory: "bg-warning-soft text-warning-foreground",
  service_provider: "bg-success-soft text-success",
  internal_team: "bg-muted text-muted-foreground",
  other: "bg-muted text-muted-foreground",
};

function propertyName(properties: ReturnType<typeof useProperties>, id?: string) {
  if (!id) return null;
  return properties.find((p) => p.id === id)?.name ?? null;
}

export function ContactsTable() {
  const contacts = useContacts();
  const properties = useProperties();
  const [editing, setEditing] = React.useState<Contact | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>(ALL);
  const [sortBy, setSortBy] = React.useState<"name" | "company">("name");

  const filtered = contacts.filter((c) => {
    if (categoryFilter !== ALL && c.category !== categoryFilter) return false;
    if (search) {
      const haystack = `${c.name} ${c.company ?? ""} ${c.role ?? ""}`.toLowerCase();
      if (!haystack.includes(search.toLowerCase())) return false;
    }
    return true;
  });
  const sorted = [...filtered].sort((a, b) =>
    sortBy === "name" ? a.name.localeCompare(b.name) : (a.company ?? "").localeCompare(b.company ?? "")
  );
  const hasActiveFilters = search || categoryFilter !== ALL;
  const { selected, toggle, toggleAll, clear, allSelected, count } = useRowSelection(sorted.map((c) => c.id));
  const [confirmingBulkDelete, setConfirmingBulkDelete] = React.useState(false);

  function handleBulkDelete() {
    const removed = sorted.filter((c) => selected.has(c.id));
    for (const id of selected) deleteContact(id);
    const count = removed.length;
    showUndoToast(`${count} contact${count === 1 ? "" : "s"} deleted`, () => {
      for (const contact of removed) restoreContact(contact);
    });
    clear();
    setConfirmingBulkDelete(false);
  }

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Everyone besides trade vendors and subcontractors — those already have a full
          home in{" "}
          <Link href="/procurement?tab=vendors" className="inline-flex items-center gap-0.5 text-primary hover:underline">
            Procurement <ArrowUpRight className="size-3" />
          </Link>.
        </p>
        <Button size="sm" onClick={() => setCreating(true)} className="shrink-0"><Plus className="size-3.5" /> New Contact</Button>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[12rem]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search name, company, or role…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-56"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Categories</SelectItem>
            {(Object.keys(CATEGORY_LABELS) as ContactCategory[]).map((c) => (
              <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="company">Company (A-Z)</SelectItem>
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setCategoryFilter(ALL); }}>Clear</Button>
        )}
      </div>

      {count > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
          <span className="text-sm font-medium text-foreground">{count} selected</span>
          {confirmingBulkDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete {count} contact{count === 1 ? "" : "s"}?</span>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>Confirm Delete</Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmingBulkDelete(false)}>Cancel</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setConfirmingBulkDelete(true)}><Trash2 className="size-3.5" /> Delete Selected</Button>
              <Button variant="ghost" size="sm" onClick={clear}>Clear Selection</Button>
            </div>
          )}
        </div>
      )}

      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="w-8 px-4 py-3"><Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" /></th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Email Address</th>
              <th className="px-4 py-3 font-medium">Contact Number</th>
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Edit</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => {
              const propName = propertyName(properties, c.relatedPropertyId);
              return (
                <tr key={c.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                  <td className="px-4 py-3"><Checkbox checked={selected.has(c.id)} onCheckedChange={() => toggle(c.id)} aria-label={`Select ${c.name}`} /></td>
                  <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.company ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge className={`${CATEGORY_CLASS[c.category]} border-transparent`}>{CATEGORY_LABELS[c.category]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.role ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.email ? (
                      <CopyableText value={c.email} href={`mailto:${c.email}`} icon={<Mail className="size-3" />} />
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.phone ? (
                      <CopyableText value={c.phone} href={`tel:${c.phone}`} icon={<Phone className="size-3" />} />
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{propName ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(c)}><Pencil className="size-3.5" /></Button>
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-muted-foreground">
                  {hasActiveFilters ? "No contacts match your filters." : "No contacts yet — add one above."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <ContactEditDialog contact={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      <ContactEditDialog contact={null} open={creating} onOpenChange={setCreating} />
    </>
  );
}
