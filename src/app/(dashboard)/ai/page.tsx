import { PageHeader } from "@/components/layout/page-header";
import { AiChat } from "@/components/ai-assistant/ai-chat";

export default function AiAssistantPage() {
  return (
    <>
      <PageHeader
        title="AI Assistant"
        description="Ask questions about your properties, projects, budgets, and maintenance — answered from your real current data."
      />
      <AiChat />
    </>
  );
}
