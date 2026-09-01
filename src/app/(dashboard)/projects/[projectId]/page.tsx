"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { ProjectMilestones } from "@/components/projects/project-milestones";
import { ProjectSchedulePreview } from "@/components/projects/project-schedule-preview";
import { ProjectRelatedFiles } from "@/components/projects/project-related-files";
import { RecordProjectView } from "@/components/projects/record-project-view";
import { useProjects } from "@/hooks/use-projects";
import { useActivities } from "@/hooks/use-activities";
import { getEffectiveCompletionPercent } from "@/lib/scheduling/compute-project-completion";
import { EditCompletionPercentDialog } from "@/components/projects/edit-completion-percent-dialog";

function formatCurrency(n?: number) {
  if (!n) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ProjectDetailsPage() {
  const params = useParams<{ projectId: string }>();
  const projects = useProjects();
  const activities = useActivities();
  const project = projects.find((p) => p.id === params.projectId);
  const [editingCompletion, setEditingCompletion] = React.useState(false);

  if (!project) notFound();

  const budgetUsedPercent =
    project.approvedBudget > 0 && project.actualCostToDate
      ? Math.round((project.actualCostToDate / project.approvedBudget) * 100)
      : 0;

  return (
    <>
      <RecordProjectView projectId={project.id} title={project.projectName} />
      <PageHeader
        title={project.projectName}
        description={`${project.address.street}, ${project.address.city}, ${project.address.state}`}
        actions={
          <Button variant="outline" asChild>
            <Link href={`/projects/${project.id}/edit`}>
              <Pencil /> Edit Project
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="flex flex-wrap items-center gap-6">
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <ProjectStatusBadge status={project.calculatedStatus} />
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
                <div>
                  <span className="text-xs text-muted-foreground">Client</span>
                  <p className="font-medium text-foreground">{project.clientName}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Start Date</span>
                  <p className="font-medium text-foreground">{formatDate(project.startDate)}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Target Completion</span>
                  <p className="font-medium text-foreground">
                    {formatDate(project.plannedCompletionDate)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">% Complete</span>
                  <p className="flex items-center gap-1.5 font-medium text-foreground">
                    {getEffectiveCompletionPercent(project, activities)}%
                    {project.manualCompletionPercent != null && (
                      <span className="text-[10px] font-normal text-muted-foreground">(manual)</span>
                    )}
                    <button onClick={() => setEditingCompletion(true)} className="text-muted-foreground hover:text-foreground">
                      <Pencil className="size-3" />
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Approved Budget</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(project.approvedBudget)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Actual Cost to Date</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(project.actualCostToDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Budget Used</span>
              <span
                className={
                  budgetUsedPercent > 100
                    ? "font-semibold text-destructive"
                    : "font-semibold text-foreground"
                }
              >
                {budgetUsedPercent}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ProjectSchedulePreview projectId={project.id} />
        <ProjectMilestones projectId={project.id} />
      </div>

      <div className="mt-4">
        <ProjectRelatedFiles projectId={project.id} />
      </div>

      <EditCompletionPercentDialog
        projectId={project.id}
        currentValue={getEffectiveCompletionPercent(project, activities)}
        isManualOverride={project.manualCompletionPercent != null}
        open={editingCompletion}
        onOpenChange={setEditingCompletion}
      />
    </>
  );
}
