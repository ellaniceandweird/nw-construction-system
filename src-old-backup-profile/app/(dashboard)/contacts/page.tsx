import { PageHeader } from "@/components/layout/page-header";
import { ContactsTable } from "@/components/contacts/contacts-table";

export default function ContactsPage() {
  return (
    <>
      <PageHeader
        title="Contacts"
        description="Design professionals, government/regulatory contacts, service providers, and internal team."
      />
      <ContactsTable />
    </>
  );
}
