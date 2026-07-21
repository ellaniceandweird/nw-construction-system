"use client";

import * as React from "react";
import { Copy, Check, MessageSquare } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface DailyFieldUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  text: string;
}

export function DailyFieldUpdateDialog({ open, onOpenChange, text }: DailyFieldUpdateDialogProps) {
  const [copied, setCopied] = React.useState(false);
  const [value, setValue] = React.useState(text);

  React.useEffect(() => {
    if (open) {
      setValue(text);
      setCopied(false);
    }
  }, [open, text]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can fail in some browser contexts — the textarea
      // below is still selectable/copyable by hand as a fallback.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="size-4" /> Daily Field Update
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Ready to paste into the group text with Pedro. Feel free to edit before copying.
        </p>
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={12}
          className="font-mono text-sm"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleCopy}>
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied!" : "Copy to Clipboard"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
