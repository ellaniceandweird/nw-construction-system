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
import { createKeyCodeEntry, updateKeyCodeEntry, deleteKeyCodeEntry } from "@/lib/maintenance/key-code-store";
import type { KeyCodeEntry } from "@/types/maintenance";

const MANUAL_ENTRY = "__manual__";

interface Props {
  entry: KeyCodeEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyCodeEditDialog({ entry, open, onOpenChange }: Props) {
  const properties = useProperties();
  const [propertyId, setPropertyId] = React.useState("");
  const [propertyName, setPropertyName] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [keyType, setKeyType] = React.useState("");
  const [keyCode, setKeyCode] = React.useState("");
  const [heldBy, setHeldBy] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setPropertyId(entry?.propertyId ?? "");
      setPropertyName(entry?.propertyName ?? "");
      setLocation(entry?.location ?? "");
      setKeyType(entry?.keyType ?? "");
      setKeyCode(entry?.keyCode ?? "");
      setHeldBy(entry?.heldBy ?? "");
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
      keyType: keyType || undefined,
      keyCode: keyCode || undefined,
      heldBy: heldBy || undefined,
      notes: notes || undefined,
    };
    if (entry) {
      updateKeyCodeEntry(entry.id, input);
    } else {
      createKeyCodeEntry(input);
    }
    onOpenChange(false);
  }

  function handleDelete() {
    if (!entry) return;
    deleteKeyCodeEntry(entry.id);
    onOpenChange(false);
  }

  const canSave = propertyName.trim().length > 0 && location.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit Key Code Entry" : "New Key Code Entry"}</DialogTitle>
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
            <Label htmlFor="location">Location / Door</Label>
            <Input id="location" className="mt-1.5" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Front Door, Back Gate" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="keyType">Key Type</Label>
              <Input id="keyType" className="mt-1.5" value={keyType} onChange={(e) => setKeyType(e.target.value)} placeholder="e.g. Physical Key, Keypad Code" />
            </div>
            <div>
              <Label htmlFor="keyCode">Code / Key #</Label>
              <Input id="keyCode" className="mt-1.5" value={keyCode} onChange={(e) => setKeyCode(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="heldBy">Held By (optional)</Label>
            <Input id="heldBy" className="mt-1.5" value={heldBy} onChange={(e) => setHeldBy(e.target.value)} placeholder="Who currently has a copy" />
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
