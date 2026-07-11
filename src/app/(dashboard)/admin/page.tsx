import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { PrintSettingsCard } from "@/components/admin/print-settings-card";

export default function AdminSettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Company configuration, users, permissions, and system-wide preferences."
      />

      <div className="flex flex-col gap-4">
        <PrintSettingsCard />

        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-1 py-16 text-center">
            <p className="w-full text-sm font-medium text-foreground">
              Users, Permissions, Automation Rules &amp; more
            </p>
            <p className="mx-auto w-full max-w-md text-sm text-muted-foreground">
              The rest of Settings — user management, role permissions, approval
              rules, automation rules, and branding — is built in Phase 9.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
