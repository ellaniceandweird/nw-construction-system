"use client";
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLES, ROLE_LABELS, type Role } from "@/types/roles";
import { updateUserRole } from "@/app/(dashboard)/admin/actions";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function UsersTable({ profiles }: { profiles: Profile[] }) {
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState(profiles);

  async function handleRoleChange(userId: string, role: Role) {
    setPendingId(userId);
    setRows((prev) => prev.map((p) => (p.id === userId ? { ...p, role } : p)));
    const result = await updateUserRole(userId, role);
    setPendingId(null);
    if (result.error) {
      // Revert on failure
      setRows(profiles);
    }
  }

  return (
    <>
      <p className="mb-3 text-xs text-muted-foreground">
        Everyone who has signed in at least once shows up here automatically —
        nothing to add manually. Change someone&apos;s role and it takes effect
        immediately.
      </p>
      <Card className="overflow-x-auto py-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Member Since</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-7">
                      {p.avatar_url && <AvatarImage src={p.avatar_url} alt={p.full_name ?? ""} />}
                      <AvatarFallback className="text-xs">{initials(p.full_name ?? p.email ?? "?")}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">{p.full_name ?? "—"}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.email}</td>
                <td className="px-4 py-3">
                  <Select
                    value={p.role}
                    onValueChange={(v) => handleRoleChange(p.id, v as Role)}
                    disabled={pendingId === p.id}
                  >
                    <SelectTrigger className="h-8 w-56"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (<SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(p.created_at)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">No one has signed in yet.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}
