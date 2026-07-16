import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { ProjectForm } from "@/components/projects/project-form";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = MOCK_PROJECTS.find((p) => p.id === projectId);

  if (!project) notFound();

  return (
    <>
      <PageHeader
        title={`Edit ${project.projectName}`}
        description="Changes here don't persist until Excel read/write is wired up in Phase 8."
      />
      <ProjectForm existingProject={project} />
    </>
  );
}
