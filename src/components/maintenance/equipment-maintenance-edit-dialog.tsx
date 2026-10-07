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
import { getPropertyShortName, resolvePropertyShortName } from "@/lib/properties/property-relations";
import { createEquipmentMaintenance, updateEquipmentMaintenance, deleteEquipmentMaintenance } from "@/lib/maintenance/equipment-maintenance-store";
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast-store";
import type { EquipmentMaintenanceSchedule } from "@/types/maintenance";

/** Dropdown value for the "Manual entry…" choice — never saved; picking it just switches the field to a text box. */
const MANUAL_PROPERTY = "__manual_property__";

interface Props {
  record: EquipmentMaintenanceSchedule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EquipmentMaintenanceEditDialog({ record, open, onOpenChange }: Props) {
  const properties = useProperties();
  const [propertyName, setPropertyName] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [systemType, setSystemType] = React.useState("");
  const [maintenanceNeeded, setMaintenanceNeeded] = React.useState("");
  const [frequency, setFrequency] = React.useState("");
  const [lastCompleted, setLastCompleted] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [manualProperty, setManualProperty] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setPropertyName(record?.propertyName ?? "");
      setLocation(record?.location ?? "");
      setSystemType(record?.systemType ?? "");
      setMaintenanceNeeded(record?.maintenanceNeeded ?? "");
      setFrequency(record?.frequency ?? "");
      setLastCompleted(record?.lastCompleted ?? "");
      setNotes(record?.notes ?? "");
      setConfirmingDelete(false);
      setManualProperty(false);
    }
  }, [record, open]);

  function handleDelete() {
    if (!record) return;
    deleteEquipmentMaintenance(record.id);
    onOpenChange(false);
  }

  async function handleSave() {
    // Empty fields are sent as null (clear), never as "" — the database
    // rejects an empty string in the Last Completed date column, which
    // is what made saving fail for any record without a date yet.
    const input = {
      propertyName: resolvePropertyShortName(propertyName, properties),
      location: location.trim(),
      systemType: systemType.trim(),
      maintenanceNeeded: maintenanceNeeded.trim() || null,
      frequency: frequency.trim() || null,
      lastCompleted: lastCompleted || null,
      notes: notes.trim() || null,
    };
    setSaving(true);
    const result = record ? await updateEquipmentMaintenance(record.id, input) : await createEquipmentMaintenance(input);
    setSaving(false);
    if (!result.ok) {
      showErrorToast(result.error ? `Couldn't save: ${result.error}` : "Couldn't save this schedule — check your connection and try again.");
      return;
    }
    showSuccessToast(record ? "Schedule updated" : "Schedule added");
    onOpenChange(false);
  }
  // Editing an existing record can always be saved, however much is
  // filled in — people fill these in over time. A brand-new row only needs
  // at least one field so an accidental click can't create an empty record.
  const hasAnyContent = [propertyName, location, systemType, maintenanceNeeded, frequency, lastCompleted, notes].some(
    (v) => v.trim() !== ""
  );
  const canSave = record ? true : hasAnyContent;

  // A property is a manual entry if the person chose "Manual entry…", or if
  // the record already carries a name that isn't in Properties (e.g. one
  // typed by hand earlier, or imported from a sheet). Typing in the box
  // pins it to manual so it can't flip back to a dropdown mid-sentence.
  const knownPropertyNames = Array.from(new Set(properties.map((p) => getPropertyShortName(p))));
  // A record saved earlier with the long "address - name" text counts as that
  // property (shown by name only), not as a manual entry.
  const selectedProperty = resolvePropertyShortName(propertyName, properties);
  const showManualProperty =
    manualProperty || (selectedProperty !== "" && properties.length > 0 && !knownPropertyNames.includes(selectedProperty));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{record ? "Edit Equipment Maintenance" : "New Equipment Maintenance"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <p className="text-xs text-muted-foreground">
            Fill in what you have — every field is optional, and you can complete the rest later.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Property</Label>
              {showManualProperty ? (
                <>
                  <Input
                    className="mt-1.5"
                    placeholder="Type the property name"
                    autoFocus={manualProperty}
                    value={propertyName}
                    onChange={(e) => {
                      setManualProperty(true);
                      setPropertyName(e.target.value);
                    }}
                  />
                  <button
                    type="button"
                    className="mt-1 text-xs text-muted-foreground underline hover:text-foreground"
                    onClick={() => {
                      setManualProperty(false);
                      setPropertyName("");
                    }}
                  >
                    Choose from the property list instead
                  </button>
                </>
              ) : (
                <Select
                  value={selectedProperty}
                  onValueChange={(v) => {
                    if (v === MANUAL_PROPERTY) {
                      setManualProperty(true);
                      setPropertyName("");
                      return;
                    }
                    setPropertyName(v);
                  }}
                >
                  <SelectTrigger className="mt-1.5 w-full">
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {knownPropertyNames.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                    <SelectItem value={MANUAL_PROPERTY}>Manual entry…</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                className="mt-1.5"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="systemType">System</Label>
            <Input
              id="systemType"
              className="mt-1.5"
              value={systemType}
              onChange={(e) => setSystemType(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="maintenanceNeeded">Maintenance Needed</Label>
            <Input
              id="maintenanceNeeded"
              className="mt-1.5"
              value={maintenanceNeeded}
              onChange={(e) => setMaintenanceNeeded(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Input
                id="frequency"
                placeholder="e.g. 3-months"
                className="mt-1.5"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="lastCompleted">Last Completed</Label>
              <Input
                id="lastCompleted"
                type="date"
                className="mt-1.5"
                value={lastCompleted}
                onChange={(e) => setLastCompleted(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" className="mt-1.5" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter className="justify-between">
          {record ? (confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Delete this record?</span>
              <Button variant="destructive" size="sm" onClick={handleDelete}>Confirm Delete</Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmingDelete(true)}>
              <Trash2 className="size-3.5" /> Delete
            </Button>
          )) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!canSave || saving}>{saving ? "Saving…" : "Save Changes"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
