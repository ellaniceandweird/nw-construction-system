"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTeamAssignments } from "@/hooks/use-team-assignments";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ProjectTeam({ projectId }: { projectId: string }) {
  const allAssignments = useTeamAssignments();
  const team = allAssignments.filter((t) => t.projectId === projectId);

  if (team.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Assignments</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No crew logged against this project yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Assignments</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {team.map((t) => (
          <div key={t.id} className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{initials(t.employeeName)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-medium text-foreground">
                {t.employeeName}
              </span>
              <span className="text-xs text-muted-foreground">{t.role}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
