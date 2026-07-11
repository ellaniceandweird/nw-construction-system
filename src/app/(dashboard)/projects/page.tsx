import Link from "next/link";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ProjectList } from "@/components/projects/project-list";

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="Project Management"
        description="Every project the company is running, with real-time health and budget status."
        actions={
          <Button asChild>
            <Link href="/projects/new">
              <Plus /> New Project
            </Link>
          </Button>
        }
      />
      <ProjectList />
    </>
  );
}
