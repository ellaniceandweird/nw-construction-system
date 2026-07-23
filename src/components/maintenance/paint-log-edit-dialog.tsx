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
  const [propertyAddress, setPropertyAddress] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [location2, setLocation2] = React.useState("");
  const [brand, setBrand] = React.useState("");
  const [productType, setProductType] = React.useState("");
  const [finish, setFinish] = React.useState("");
  const [color, setColor] = React.useState("");
  const [colorCode, setColorCode] = React.useState("");
  const [comments, setComments] = React.useState("");
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setPropertyId(entry?.propertyId ?? "");
      setPropertyName(entry?.propertyName ?? "");
      setPropertyAddress(entry?.propertyAddress ?? "");
      setLocation(entry?.location ?? "");
      setLocation2(entry?.location2 ?? "");
      setBrand(entry?.brand ?? "");
      setProductType(entry?.productType ?? "");
      setFinish(entry?.finish ?? "");
      setColor(entry?.color ?? "");
      setColorCode(entry?.colorCode ?? "");
      setComments(entry?.comments ?? "");
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
    if (property?.address) setPropertyAddress(property.address);
  }

  function handleSave() {
    const input = {
      propertyId: propertyId || undefined,
      propertyName,
      propertyAddress: propertyAddress || undefined,
      location,
      location2: location2 || undefined,
      brand: brand || undefined,
      productType: productType || undefined,
      finish: finish || undefined,
      color: color || undefined,
      colorCode: colorCode || undefined,
      comments: comments || undefined,
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
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
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
            <Label htmlFor="propertyAddress">Property Address (optional)</Label>
            <Input id="propertyAddress" className="mt-1.5" value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} placeholder="e.g. 60 South Front Street" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" className="mt-1.5" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Kitchen, Exterior Siding" />
            </div>
            <div>
              <Label htmlFor="location2">Location 2 (optional)</Label>
              <Input id="location2" className="mt-1.5" value={location2} onChange={(e) => setLocation2(e.target.value)} placeholder="e.g. Wall & Ceiling, 1st Coat" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" className="mt-1.5" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Benjamin Moore" />
            </div>
            <div>
              <Label htmlFor="productType">Product / Type</Label>
              <Input id="productType" className="mt-1.5" value={productType} onChange={(e) => setProductType(e.target.value)} placeholder="e.g. Regal Select" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="finish">Finish</Label>
              <Input id="finish" className="mt-1.5" value={finish} onChange={(e) => setFinish(e.target.value)} placeholder="e.g. Eggshell, Semi Gloss" />
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Input id="color" className="mt-1.5" value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g. Decorators White" />
            </div>
          </div>
          <div>
            <Label htmlFor="colorCode">Custom Mix Code (optional)</Label>
            <Textarea id="colorCode" className="mt-1.5 font-mono text-xs" value={colorCode} onChange={(e) => setColorCode(e.target.value)} placeholder="Custom mixing formula, if any" />
          </div>
          <div>
            <Label htmlFor="comments">Comments</Label>
            <Textarea id="comments" className="mt-1.5" value={comments} onChange={(e) => setComments(e.target.value)} />
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
