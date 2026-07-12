import { PageHeader } from "@/components/layout/page-header";
import { ProjectForm } from "@/components/projects/project-form";

export default function NewProjectPage() {
  return (
    <>
      <PageHeader
        title="New Project"
        description="Create a new project record. Validation matches your Software Design Specification's project fields."
      />
      <ProjectForm />
    </>
  );
}
