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
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast-store";
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
  const [spaceName, setSpaceName] = React.useState("");
  const [doorIdentifier, setDoorIdentifier] = React.useState("");
  const [accessCode, setAccessCode] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setPropertyId(entry?.propertyId ?? "");
      setPropertyName(entry?.propertyName ?? "");
      setSpaceName(entry?.spaceName ?? "");
      setDoorIdentifier(entry?.doorIdentifier ?? "");
      setAccessCode(entry?.accessCode ?? "");
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

  async function handleSave() {
    setSaving(true);
    const input = {
      propertyId: propertyId || undefined,
      propertyName,
      spaceName: spaceName || undefined,
      doorIdentifier,
      accessCode: accessCode || undefined,
      notes: notes || undefined,
    };
    const ok = entry
      ? await updateKeyCodeEntry(entry.id, input)
      : await createKeyCodeEntry(input);
    setSaving(false);
    if (!ok.ok) {
      showErrorToast(
        ok.error
          ? `Couldn't save: ${ok.error}`
          : "Couldn't save this key code entry — check your connection and try again."
      );
      return;
    }
    showSuccessToast(entry ? "Key code entry updated" : "Key code entry added");
    onOpenChange(false);
  }

  function handleDelete() {
    if (!entry) return;
    deleteKeyCodeEntry(entry.id);
    onOpenChange(false);
  }

  const canSave = propertyName.trim().length > 0 && doorIdentifier.trim().length > 0;

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
            <Label htmlFor="spaceName">Space / Tenant Name (optional)</Label>
            <Input id="spaceName" className="mt-1.5" value={spaceName} onChange={(e) => setSpaceName(e.target.value)} placeholder="e.g. Made X, Common, Office" />
          </div>
          <div>
            <Label htmlFor="doorIdentifier">Door Identifier</Label>
            <Input id="doorIdentifier" className="mt-1.5" value={doorIdentifier} onChange={(e) => setDoorIdentifier(e.target.value)} placeholder="e.g. Spiral Stairwell, Rear Exterior" />
          </div>
          <div>
            <Label htmlFor="accessCode">Access Code</Label>
            <Input id="accessCode" className="mt-1.5 font-mono" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} placeholder="e.g. 6168, 2038" />
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
            <Button onClick={handleSave} disabled={!canSave || saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
