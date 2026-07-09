import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export function ModulePlaceholder({
  title,
  description,
  phase,
}: {
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-1 py-16 text-center">
          <p className="text-sm font-medium text-foreground">
            {title} module scaffold
          </p>
          <p className="max-w-md text-sm text-muted-foreground">
            This screen is wired into navigation and routing now. Full
            functionality is built in <span className="font-medium">{phase}</span>.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
