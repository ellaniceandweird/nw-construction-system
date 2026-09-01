"use client";

import * as React from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProject } from "@/lib/projects/project-store";
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast-store";

interface Props {
  projectId: string;
  currentValue: number;
  isManualOverride: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCompletionPercentDialog({ projectId, currentValue, isManualOverride, open, onOpenChange }: Props) {
  const [value, setValue] = React.useState(String(currentValue));
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) setValue(String(currentValue));
  }, [open, currentValue]);

  async function handleSave() {
    const num = Math.max(0, Math.min(100, parseFloat(value) || 0));
    setSaving(true);
    const result = await updateProject(projectId, { manualCompletionPercent: num });
    setSaving(false);
    if (!result.ok) {
      showErrorToast(result.error ? `Couldn't save: ${result.error}` : "Couldn't save this value — check your connection and try again.");
      return;
    }
    showSuccessToast("% Complete updated");
    onOpenChange(false);
  }

  async function handleResetToAuto() {
    setSaving(true);
    const result = await updateProject(projectId, { manualCompletionPercent: undefined });
    setSaving(false);
    if (!result.ok) {
      showErrorToast(result.error ? `Couldn't reset: ${result.error}` : "Couldn't reset — check your connection and try again.");
      return;
    }
    showSuccessToast("Back to auto-calculated");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit % Complete</DialogTitle>
          <DialogDescription>
            Normally calculated automatically from completed activities. Setting a value here
            overrides that until you reset it back to automatic.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label htmlFor="completionPercent">% Complete</Label>
          <Input
            id="completionPercent"
            type="number"
            min={0}
            max={100}
            className="mt-1.5"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <DialogFooter className="justify-between">
          {isManualOverride ? (
            <Button variant="ghost" size="sm" onClick={handleResetToAuto} disabled={saving}>
              Reset to Auto-Calculated
            </Button>
          ) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
