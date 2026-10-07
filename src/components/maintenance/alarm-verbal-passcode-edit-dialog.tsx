"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useProperties } from "@/hooks/use-properties";
import { getPropertyShortName } from "@/lib/properties/property-relations";
import { createAlarmVerbalPasscode, updateAlarmVerbalPasscode, deleteAlarmVerbalPasscode } from "@/lib/maintenance/alarm-verbal-passcode-store";
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast-store";
import type { AlarmVerbalPasscode } from "@/types/alarm-verbal-passcode";

const MANUAL_ENTRY = "manual";

interface Props {
  entry: AlarmVerbalPasscode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AlarmVerbalPasscodeEditDialog({ entry, open, onOpenChange }: Props) {
  const properties = useProperties();
  const [propertyId, setPropertyId] = React.useState("");
  const [propertyName, setPropertyName] = React.useState("");
  const [verbalPasscode, setVerbalPasscode] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setConfirmingDelete(false);
    setPropertyId(entry?.propertyId ?? (entry ? MANUAL_ENTRY : ""));
    setPropertyName(entry?.propertyName ?? "");
    setVerbalPasscode(entry?.verbalPasscode ?? "");
    setNotes(entry?.notes ?? "");
  }, [entry, open]);

  function handlePropertyChange(value: string) {
    setPropertyId(value);
    if (value === MANUAL_ENTRY) {
      setPropertyName("");
      return;
    }
    const property = properties.find((p) => p.id === value);
    setPropertyName(property ? getPropertyShortName(property) : "");
  }

  async function handleSave() {
    if (!propertyName || !verbalPasscode) return;
    const input = {
      propertyId: propertyId === MANUAL_ENTRY ? undefined : propertyId || undefined,
      propertyName: (() => {
        const linked = properties.find((p) => p.id === propertyId);
        return linked ? getPropertyShortName(linked) : propertyName;
      })(),
      verbalPasscode,
      notes: notes || undefined,
    };
    setSaving(true);
    const result = entry ? await updateAlarmVerbalPasscode(entry.id, input) : await createAlarmVerbalPasscode(input);
    setSaving(false);
    if (!result.ok) {
      showErrorToast(result.error ? `Couldn't save: ${result.error}` : "Couldn't save this passcode — check your connection and try again.");
      return;
    }
    showSuccessToast(entry ? "Passcode updated" : "Passcode added");
    onOpenChange(false);
  }

  function handleDelete() {
    if (!entry) return;
    deleteAlarmVerbalPasscode(entry.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit Alarm Verbal Passcode" : "New Alarm Verbal Passcode"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label>Property</Label>
            <SearchableSelect
              className="mt-1.5"
              value={propertyId}
              placeholder="Select property"
              searchPlaceholder="Type a property name…"
              options={properties.map((p) => ({ value: p.id, label: getPropertyShortName(p) }))}
              trailingOptions={[{ value: MANUAL_ENTRY, label: "Manual entry…" }]}
              onChange={handlePropertyChange}
            />
            {propertyId === MANUAL_ENTRY && (
              <Input className="mt-2" placeholder="Property name" value={propertyName} onChange={(e) => setPropertyName(e.target.value)} />
            )}
          </div>
          <div>
            <Label htmlFor="verbalPasscode">Verbal Passcode</Label>
            <Input id="verbalPasscode" className="mt-1.5" value={verbalPasscode} onChange={(e) => setVerbalPasscode(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" className="mt-1.5" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter className="justify-between">
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
            <Button onClick={handleSave} disabled={!propertyName || !verbalPasscode || saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
