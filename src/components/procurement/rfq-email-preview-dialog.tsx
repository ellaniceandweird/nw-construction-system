"use client";

import * as React from "react";
import { Mail, Paperclip } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateRfqEmailContent } from "@/lib/procurement/rfq-email";
import { useVendors } from "@/hooks/use-vendors";
import { useProjects } from "@/hooks/use-projects";
import type { RequestForQuotation } from "@/types/procurement";

interface Props {
  rfq: RequestForQuotation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RfqEmailPreviewDialog({ rfq, open, onOpenChange }: Props) {
  const projects = useProjects();
  const vendors = useVendors();
  const invitedVendors = rfq ? vendors.filter((v) => rfq.vendorIds.includes(v.id)) : [];
  const [vendorId, setVendorId] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");

  React.useEffect(() => {
    if (open && rfq) {
      const firstVendor = invitedVendors[0];
      setVendorId(firstVendor?.id ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, rfq]);

  React.useEffect(() => {
    if (!rfq || !vendorId) return;
    const vendor = vendors.find((v) => v.id === vendorId);
    const project = projects.find((p) => p.id === rfq.projectId);
    const { subject: subj, body: bd } = generateRfqEmailContent({
      vendorContactName: vendor?.primaryContact,
      projectName: project?.projectName ?? "the project",
      materialList: rfq.materialList,
      dueDate: rfq.dueDate,
      attachments: rfq.attachments,
    });
    setSubject(subj);
    setBody(bd);
  }, [rfq, vendorId]);

  const vendor = vendors.find((v) => v.id === vendorId);

  function handleOpenInMail() {
    if (!vendor?.email) return;
    const url = `mailto:${encodeURIComponent(vendor.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Mail className="size-4" /> Quote Request Email</DialogTitle>
          <DialogDescription>
            Preview and edit before sending. This opens your own email app with everything
            filled in — Project NW doesn&apos;t send email on its own behalf.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div>
            <Label>To</Label>
            <Select value={vendorId} onValueChange={setVendorId}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Select vendor" /></SelectTrigger>
              <SelectContent>
                {invitedVendors.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.vendorName}{v.email ? ` — ${v.email}` : " (no email on file)"}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" className="mt-1.5" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="body">Body</Label>
            <Textarea id="body" rows={12} className="mt-1.5 font-mono text-sm" value={body} onChange={(e) => setBody(e.target.value)} />
          </div>

          {rfq?.attachments && rfq.attachments.length > 0 && (
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Paperclip className="mt-0.5 size-3 shrink-0" />
              Reference files are included as links in the body above — email links can&apos;t
              carry real file attachments, so recipients just click through.
            </p>
          )}

          {vendor && !vendor.email && (
            <p className="text-xs text-warning-foreground">
              No email on file for {vendor.vendorName} — add one in Vendors before sending.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={handleOpenInMail} disabled={!vendor?.email}>
            <Mail className="size-3.5" /> Open in Mail
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
