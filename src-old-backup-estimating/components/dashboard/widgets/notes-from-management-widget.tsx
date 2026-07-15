import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

/**
 * Placeholder widget — there's no "management notes" data source yet.
 * This demonstrates the UI slot; wiring it to a real notes feature
 * (who can post, audience, pinning) is future work, not part of any
 * module built so far.
 */
export function NotesFromManagementWidget() {
  return (
    <Card className="bg-info-soft/70 border-info/30">
      <CardHeader>
        <CardTitle>Notes from Management</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-foreground">
          Focus on getting the roofing project back on track.
        </p>
        <span className="text-xs font-medium text-muted-foreground">— Ben</span>
        <span className="text-xs text-muted-foreground">
          Example note — this widget isn&apos;t wired to real data yet.
        </span>
      </CardContent>
    </Card>
  );
}
