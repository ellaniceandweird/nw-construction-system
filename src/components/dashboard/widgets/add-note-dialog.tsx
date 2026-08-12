"use client";
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addNote } from "@/lib/dashboard/notes-store";
import { showErrorToast, showSuccessToast } from "@/lib/toast/toast-store";

interface Props { open: boolean; onOpenChange: (open: boolean) => void; }

export function AddNoteDialog({ open, onOpenChange }: Props) {
  const [message, setMessage] = React.useState("");
  const [author, setAuthor] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function handleSave() {
    if (!message || !author) return;
    setSaving(true);
    const result = await addNote(message, author);
    setSaving(false);
    if (!result.ok) {
      showErrorToast(result.error ? `Couldn't post: ${result.error}` : "Couldn't post this note — check your connection and try again.");
      return;
    }
    showSuccessToast("Note posted");
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
          <Button onClick={handleSave} disabled={!message || !author || saving}>{saving ? "Posting…" : "Post Note"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
