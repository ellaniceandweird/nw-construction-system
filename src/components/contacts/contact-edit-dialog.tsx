"use client";
import * as React from "react";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createContact, updateContact, deleteContact } from "@/lib/contacts/contact-store";
import { useProperties } from "@/hooks/use-properties";
import type { Contact, ContactCategory } from "@/types/contacts";

interface Props { contact: Contact | null; open: boolean; onOpenChange: (open: boolean) => void; }
const CATEGORY_OPTIONS: { value: ContactCategory; label: string }[] = [
  { value: "design_professional", label: "Design Professional" },
  { value: "government_regulatory", label: "Government / Regulatory" },
  { value: "service_provider", label: "Service Provider" },
  { value: "internal_team", label: "Internal Team" },
  { value: "other", label: "Other" },
];
const NONE = "none";

export function ContactEditDialog({ contact, open, onOpenChange }: Props) {
  const properties = useProperties();
  const [name, setName] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [category, setCategory] = React.useState<ContactCategory>("service_provider");
  const [role, setRole] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [relatedPropertyId, setRelatedPropertyId] = React.useState(NONE);
  const [notes, setNotes] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName(contact?.name ?? "");
      setCompany(contact?.company ?? "");
      setCategory(contact?.category ?? "service_provider");
      setRole(contact?.role ?? "");
      setEmail(contact?.email ?? "");
      setPhone(contact?.phone ?? "");
      setAddress(contact?.address ?? "");
      setRelatedPropertyId(contact?.relatedPropertyId ?? NONE);
      setNotes(contact?.notes ?? "");
      setConfirmingDelete(false);
    }
  }, [contact, open]);

  function handleSave() {
    if (!name) return;
    const input = {
      name, company: company || undefined, category, role: role || undefined,
      email: email || undefined, phone: phone || undefined, address: address || undefined,
      relatedPropertyId: relatedPropertyId === NONE ? undefined : relatedPropertyId,
      notes: notes || undefined,
    };
    if (contact) { updateContact(contact.id, input); } else { createContact(input); }
    onOpenChange(false);
  }
  function handleDelete() { if (!contact) return; deleteContact(contact.id); onOpenChange(false); }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{contact ? `Edit ${contact.name}` : "New Contact"}</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="name">Name</Label><Input id="name" className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label htmlFor="company">Company (optional)</Label><Input id="company" className="mt-1.5" value={company} onChange={(e) => setCompany(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ContactCategory)}>
                <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORY_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="role">Role (optional)</Label><Input id="role" className="mt-1.5" placeholder="e.g. Architect, Bookkeeper" value={role} onChange={(e) => setRole(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="email">Email (optional)</Label><Input id="email" type="email" className="mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><Label htmlFor="phone">Phone (optional)</Label><Input id="phone" className="mt-1.5" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          </div>
          <div><Label htmlFor="address">Address (optional)</Label><Input id="address" className="mt-1.5" value={address} onChange={(e) => setAddress(e.target.value)} /></div>
          <div>
            <Label>Related Property (optional)</Label>
            <Select value={relatedPropertyId} onValueChange={setRelatedPropertyId}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>None</SelectItem>
                {properties.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div><Label htmlFor="notes">Notes (optional)</Label><Textarea id="notes" className="mt-1.5" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        </div>
        <DialogFooter className="sm:justify-between">
          {contact ? (confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete this contact?</span>
              <Button variant="destructive" size="sm" onClick={handleDelete}>Confirm Delete</Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmingDelete(true)}><Trash2 className="size-3.5" /> Delete</Button>
          )) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!name}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
