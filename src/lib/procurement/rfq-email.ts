interface RfqEmailInput {
  vendorContactName?: string;
  projectName: string;
  materialList: string;
  dueDate: string;
  attachments?: { name: string; url: string }[];
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/**
 * Short, warm, human email body for inviting a vendor to quote — not a
 * template that reads like a form letter. Keeps attachments as Drive
 * links in the body since mailto: links can't carry real file
 * attachments; the recipient just clicks through.
 */
export function generateRfqEmailContent(input: RfqEmailInput): { subject: string; body: string } {
  const greeting = input.vendorContactName ? `Hi ${input.vendorContactName},` : "Hi there,";

  const lines = [
    greeting,
    "",
    `Hope you're doing well! We'd love to get a quote from you for ${input.projectName} — here's what we need:`,
    "",
    input.materialList,
    "",
    `If you could get us pricing by ${formatDate(input.dueDate)}, that'd be great.`,
  ];

  if (input.attachments && input.attachments.length > 0) {
    lines.push("", "A few reference files:");
    for (const a of input.attachments) {
      lines.push(`- ${a.name}: ${a.url}`);
    }
  }

  lines.push("", "Thanks so much — let us know if you have any questions!");

  return {
    subject: `Quote Request — ${input.projectName}`,
    body: lines.join("\n"),
  };
}
