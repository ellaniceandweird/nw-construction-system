"use client";

import { useParams, notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { ProjectForm } from "@/components/projects/project-form";
import { useProjects } from "@/hooks/use-projects";

export default function EditProjectPage() {
  const params = useParams<{ projectId: string }>();
  const projects = useProjects();
  const project = projects.find((p) => p.id === params.projectId);

  if (!project) notFound();

  return (
    <>
      <PageHeader
        title={`Edit ${project.projectName}`}
      />
      <ProjectForm existingProject={project} />
    </>
  );
}
