"use client";
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addNote } from "@/lib/dashboard/notes-store";

interface Props { open: boolean; onOpenChange: (open: boolean) => void; }

export function AddNoteDialog({ open, onOpenChange }: Props) {
  const [message, setMessage] = React.useState("");
  const [author, setAuthor] = React.useState("");

  function handleSave() {
    if (!message || !author) return;
    addNote(message, author);
    setMessage("");
    setAuthor("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Note</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="message">Note</Label>
            <Textarea id="message" className="mt-1.5" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="author">Your Name</Label>
            <Input id="author" className="mt-1.5" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!message || !author}>Post Note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
