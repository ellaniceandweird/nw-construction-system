"use client";
import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useManagementNotes } from "@/hooks/use-management-notes";
import { deleteNote } from "@/lib/dashboard/notes-store";
import { AddNoteDialog } from "@/components/dashboard/widgets/add-note-dialog";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function NotesFromManagementWidget() {
  const notes = useManagementNotes();
  const [adding, setAdding] = React.useState(false);

  return (
    <Card className="bg-info-soft/70 border-info/30">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Notes</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
          <Plus className="size-3.5" /> Add Note
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {notes.length === 0 && (
          <p className="text-sm text-muted-foreground">No notes yet — add the first one.</p>
        )}
        {notes.map((note) => (
          <div key={note.id} className="flex items-start justify-between gap-2 border-b border-info/20 pb-2 last:border-0 last:pb-0">
            <div>
              <p className="text-sm text-foreground">{note.message}</p>
              <span className="text-xs font-medium text-muted-foreground">
                — {note.author}, {formatDate(note.createdDate)}
              </span>
            </div>
            <Button variant="ghost" size="icon" className="size-6 shrink-0" onClick={() => deleteNote(note.id)}>
              <Trash2 className="size-3 text-destructive" />
            </Button>
          </div>
        ))}
      </CardContent>
      <AddNoteDialog open={adding} onOpenChange={setAdding} />
    </Card>
  );
}
