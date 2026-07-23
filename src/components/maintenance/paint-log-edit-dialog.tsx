"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProperties } from "@/hooks/use-properties";
import { createPaintLogEntry, updatePaintLogEntry, deletePaintLogEntry } from "@/lib/maintenance/paint-log-store";
import type { PaintLogEntry } from "@/types/maintenance";

const MANUAL_ENTRY = "__manual__";

interface Props {
  entry: PaintLogEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaintLogEditDialog({ entry, open, onOpenChange }: Props) {
  const properties = useProperties();
  const [propertyId, setPropertyId] = React.useState("");
  const [propertyName, setPropertyName] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [brand, setBrand] = React.useState("");
  const [colorName, setColorName] = React.useState("");
  const [colorCode, setColorCode] = React.useState("");
  const [sheen, setSheen] = React.useState("");
  const [dateApplied, setDateApplied] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setPropertyId(entry?.propertyId ?? "");
      setPropertyName(entry?.propertyName ?? "");
      setLocation(entry?.location ?? "");
      setBrand(entry?.brand ?? "");
      setColorName(entry?.colorName ?? "");
      setColorCode(entry?.colorCode ?? "");
      setSheen(entry?.sheen ?? "");
      setDateApplied(entry?.dateApplied ?? "");
      setNotes(entry?.notes ?? "");
      setConfirmingDelete(false);
    }
  }, [entry, open]);

  function handlePropertyChange(value: string) {
    if (value === MANUAL_ENTRY) {
      setPropertyId("");
      setPropertyName("");
      return;
    }
    const property = properties.find((p) => p.id === value);
    setPropertyId(value);
    setPropertyName(property?.name ?? "");
  }

  function handleSave() {
    const input = {
      propertyId: propertyId || undefined,
      propertyName,
      location,
      brand: brand || undefined,
      colorName: colorName || undefined,
      colorCode: colorCode || undefined,
      sheen: sheen || undefined,
      dateApplied: dateApplied || undefined,
      notes: notes || undefined,
    };
    if (entry) {
      updatePaintLogEntry(entry.id, input);
    } else {
      createPaintLogEntry(input);
    }
    onOpenChange(false);
  }

  function handleDelete() {
    if (!entry) return;
    deletePaintLogEntry(entry.id);
    onOpenChange(false);
  }

  const canSave = propertyName.trim().length > 0 && location.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit Paint Log Entry" : "New Paint Log Entry"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label>Property</Label>
            <Select value={propertyId || MANUAL_ENTRY} onValueChange={handlePropertyChange}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select property" /></SelectTrigger>
              <SelectContent>
                {properties.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                <SelectItem value={MANUAL_ENTRY}>Manual entry…</SelectItem>
              </SelectContent>
            </Select>
            {!propertyId && (
              <Input
                className="mt-1.5"
                placeholder="Type property name"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
              />
            )}
          </div>
          <div>
            <Label htmlFor="location">Location / Room</Label>
            <Input id="location" className="mt-1.5" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Kitchen, Exterior Trim" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" className="mt-1.5" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Benjamin Moore" />
            </div>
            <div>
              <Label htmlFor="sheen">Sheen / Finish</Label>
              <Input id="sheen" className="mt-1.5" value={sheen} onChange={(e) => setSheen(e.target.value)} placeholder="e.g. Eggshell" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="colorName">Color Name</Label>
              <Input id="colorName" className="mt-1.5" value={colorName} onChange={(e) => setColorName(e.target.value)} placeholder="e.g. Simply White" />
            </div>
            <div>
              <Label htmlFor="colorCode">Color Code</Label>
              <Input id="colorCode" className="mt-1.5" value={colorCode} onChange={(e) => setColorCode(e.target.value)} placeholder="e.g. OC-117" />
            </div>
          </div>
          <div>
            <Label htmlFor="dateApplied">Date Applied</Label>
            <Input id="dateApplied" type="date" className="mt-1.5" value={dateApplied} onChange={(e) => setDateApplied(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" className="mt-1.5" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          {entry ? (confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete this entry?</span>
              <Button variant="destructive" size="sm" onClick={handleDelete}>Confirm Delete</Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmingDelete(true)}>
              <Trash2 className="size-3.5" /> Delete
            </Button>
          )) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!canSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
