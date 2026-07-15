"use client";

import * as React from "react";

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
import { updateEquipmentMaintenance } from "@/lib/maintenance/equipment-maintenance-store";
import type { EquipmentMaintenanceSchedule } from "@/types/maintenance";

interface Props {
  record: EquipmentMaintenanceSchedule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EquipmentMaintenanceEditDialog({ record, open, onOpenChange }: Props) {
  const [propertyName, setPropertyName] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [systemType, setSystemType] = React.useState("");
  const [maintenanceNeeded, setMaintenanceNeeded] = React.useState("");
  const [frequency, setFrequency] = React.useState("");
  const [lastCompleted, setLastCompleted] = React.useState("");
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    if (record) {
      setPropertyName(record.propertyName);
      setLocation(record.location);
      setSystemType(record.systemType);
      setMaintenanceNeeded(record.maintenanceNeeded ?? "");
      setFrequency(record.frequency ?? "");
      setLastCompleted(record.lastCompleted ?? "");
      setNotes(record.notes ?? "");
    }
  }, [record]);

  function handleSave() {
    if (!record) return;
    updateEquipmentMaintenance(record.id, {
      propertyName,
      location,
      systemType,
      maintenanceNeeded,
      frequency,
      lastCompleted,
      notes,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Equipment Maintenance</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="propertyName">Property</Label>
              <Input
                id="propertyName"
                className="mt-1.5"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
              />
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
