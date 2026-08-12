"use client";

import * as React from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateDailyLogWeather } from "@/lib/field-operations/daily-log-store";
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast-store";
import type { WeatherCondition } from "@/types/field-operations";

interface Props {
  logId: string;
  currentWeather: WeatherCondition;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WEATHER_OPTIONS: { value: WeatherCondition; label: string }[] = [
  { value: "clear", label: "Clear" },
  { value: "cloudy", label: "Cloudy" },
  { value: "partly_cloudy", label: "Partly Cloudy" },
  { value: "light_rain", label: "Light Rain" },
  { value: "heavy_rain", label: "Heavy Rain" },
  { value: "snow", label: "Snow" },
  { value: "high_winds", label: "High Winds" },
  { value: "fog", label: "Fog" },
  { value: "storm", label: "Storm" },
  { value: "extreme_heat", label: "Extreme Heat" },
  { value: "extreme_cold", label: "Extreme Cold" },
];

export function EditDailyLogWeatherDialog({ logId, currentWeather, open, onOpenChange }: Props) {
  const [weather, setWeather] = React.useState<WeatherCondition>(currentWeather);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) setWeather(currentWeather);
  }, [open, currentWeather]);

  async function handleSave() {
    setSaving(true);
    const result = await updateDailyLogWeather(logId, weather);
    setSaving(false);
    if (!result.ok) {
      showErrorToast(result.error ? `Couldn't save: ${result.error}` : "Couldn't save this weather — check your connection and try again.");
      return;
    }
    showSuccessToast("Weather updated");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Weather</DialogTitle>
        </DialogHeader>
        <div>
          <Label>Weather Condition</Label>
          <Select value={weather} onValueChange={(v) => setWeather(v as WeatherCondition)}>
            <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {WEATHER_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
