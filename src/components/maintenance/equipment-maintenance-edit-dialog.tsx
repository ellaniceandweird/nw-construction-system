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
import { createEquipmentMaintenance, updateEquipmentMaintenance, deleteEquipmentMaintenance } from "@/lib/maintenance/equipment-maintenance-store";
import type { EquipmentMaintenanceSchedule } from "@/types/maintenance";

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
    }
  }, [record, open]);

  function handleDelete() {
    if (!record) return;
    deleteEquipmentMaintenance(record.id);
    onOpenChange(false);
  }

  function handleSave() {
    const input = { propertyName, location, systemType, maintenanceNeeded, frequency, lastCompleted, notes };
    if (record) {
      updateEquipmentMaintenance(record.id, input);
    } else {
      createEquipmentMaintenance(input);
    }
    onOpenChange(false);
  }
  const canSave = !!propertyName && !!location && !!systemType;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{record ? "Edit Equipment Maintenance" : "New Equipment Maintenance"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Property</Label>
              <Select value={propertyName} onValueChange={setPropertyName}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

        <DialogFooter className="sm:justify-between">
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
            <Button onClick={handleSave} disabled={!canSave}>Save Changes</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
