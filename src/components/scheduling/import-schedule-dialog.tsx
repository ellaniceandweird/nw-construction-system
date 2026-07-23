"use client";

import * as React from "react";
import { Upload, AlertTriangle, FileSpreadsheet, FileText } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjects } from "@/hooks/use-projects";
import { addActivity } from "@/lib/scheduling/activity-store";
import { parseExcelFile } from "@/lib/scheduling/import/parse-excel";
import { parsePdfFile } from "@/lib/scheduling/import/parse-pdf";
import type { ParsedActivityRow } from "@/lib/scheduling/import/shared";

interface ImportScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Stage = "pick" | "parsing" | "review" | "done";

export function ImportScheduleDialog({ open, onOpenChange }: ImportScheduleDialogProps) {
  const projects = useProjects();
  const [stage, setStage] = React.useState<Stage>("pick");
  const [fileName, setFileName] = React.useState("");
  const [fileKind, setFileKind] = React.useState<"excel" | "pdf" | null>(null);
  const [rows, setRows] = React.useState<ParsedActivityRow[]>([]);
  const [error, setError] = React.useState("");
  const [importedCount, setImportedCount] = React.useState(0);

  function reset() {
    setStage("pick");
    setFileName("");
    setFileKind(null);
    setRows([]);
    setError("");
    setImportedCount(0);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setFileName(file.name);
    setStage("parsing");

    const ext = file.name.split(".").pop()?.toLowerCase();

    try {
      let parsed: ParsedActivityRow[] = [];
      if (ext === "xlsx" || ext === "xls" || ext === "csv") {
        setFileKind("excel");
        parsed = await parseExcelFile(file, projects);
      } else if (ext === "pdf") {
        setFileKind("pdf");
        parsed = await parsePdfFile(file, projects);
      } else {
        setError("Please upload a .xlsx, .csv, or .pdf file.");
        setStage("pick");
        return;
      }

      if (parsed.length === 0) {
        setError(
          "No schedule rows could be found in this file. Check that it has a Project, Activity, Start, and Finish column (Excel) or a readable table (PDF)."
        );
        setStage("pick");
        return;
      }

      setRows(parsed);
      setStage("review");
    } catch {
      setError("Something went wrong reading that file. Please double-check the format and try again.");
      setStage("pick");
    }
  }

  function updateRow(rowId: string, patch: Partial<ParsedActivityRow>) {
    setRows((prev) => prev.map((r) => (r.rowId === rowId ? { ...r, ...patch } : r)));
  }

  function handleConfirmImport() {
    const toImport = rows.filter(
      (r) => r.include && r.matchedProjectId && r.plannedStart && r.plannedFinish && r.activityName
    );

    for (const row of toImport) {
      const project = projects.find((p) => p.id === row.matchedProjectId);
      addActivity(
        {
          projectId: row.matchedProjectId!,
          name: row.activityName,
          plannedStart: row.plannedStart,
          plannedFinish: row.plannedFinish,
          requiredManpower: row.requiredManpower,
          status: row.status,
          isCritical: false,
        },
        project?.projectName ?? "Unknown Project"
      );
    }

    setImportedCount(toImport.length);
    setStage("done");
  }

  const readyCount = rows.filter(
    (r) => r.include && r.matchedProjectId && r.plannedStart && r.plannedFinish
  ).length;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import Schedule from Excel or PDF</DialogTitle>
          <DialogDescription>
            Imported activities are added to the Master Schedule — every lookahead,
            weekly, and daily view updates automatically. Nothing is added until you
            review and confirm below.
          </DialogDescription>
        </DialogHeader>

        {stage === "pick" && (
          <div className="flex flex-col gap-4">
            <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border p-10 text-center hover:bg-accent/40">
              <Upload className="size-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Click to choose a file, or drag one here
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  .xlsx, .xls, .csv, or .pdf
                </p>
              </div>
              <input
                type="file"
                accept=".xlsx,.xls,.csv,.pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
            {error && (
              <p className="flex items-start gap-2 rounded-lg bg-destructive-soft p-3 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                {error}
              </p>
            )}
            <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">A note on reliability</p>
              <p className="mt-1">
                <strong>Excel/CSV</strong> imports are reliable — it reads real columns
                (Project, Activity, Start, Finish, Manpower, Status).
                <strong> PDF</strong> imports are best-effort only: PDFs don&apos;t have real
                table structure, so every PDF row starts unchecked and needs your review
                before anything is added.
              </p>
            </div>
          </div>
        )}

        {stage === "parsing" && (
          <div className="flex flex-col items-center gap-3 py-12">
            {fileKind === "pdf" ? (
              <FileText className="size-8 animate-pulse text-muted-foreground" />
            ) : (
              <FileSpreadsheet className="size-8 animate-pulse text-muted-foreground" />
            )}
            <p className="text-sm text-muted-foreground">Reading {fileName}…</p>
          </div>
        )}

        {stage === "review" && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Found {rows.length} row{rows.length === 1 ? "" : "s"} in {fileName}. Review
              and correct anything below, then confirm.
              {fileKind === "pdf" && (
                <span className="mt-1 block font-medium text-warning-foreground">
                  PDF rows start unchecked — verify each one before including it.
                </span>
              )}
            </p>

            <div className="max-h-96 overflow-y-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-2 py-2"></th>
                    <th className="px-2 py-2">Project</th>
                    <th className="px-2 py-2">Activity</th>
                    <th className="px-2 py-2">Start</th>
                    <th className="px-2 py-2">Finish</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.rowId} className="border-b border-border/60 last:border-0 align-top">
                      <td className="px-2 py-2">
                        <Checkbox
                          checked={row.include}
                          onCheckedChange={(checked) =>
                            updateRow(row.rowId, { include: checked === true })
                          }
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Select
                          value={row.matchedProjectId ?? ""}
                          onValueChange={(v) => updateRow(row.rowId, { matchedProjectId: v })}
                        >
                          <SelectTrigger className="h-8 w-40 text-xs">
                            <SelectValue placeholder="Select…" />
                          </SelectTrigger>
                          <SelectContent>
                            {projects.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.projectName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {!row.matchedProjectId && (
                          <p className="mt-1 text-destructive">Pick a project</p>
                        )}
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          value={row.activityName}
                          onChange={(e) => updateRow(row.rowId, { activityName: e.target.value })}
                          className="h-8 w-48 text-xs"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          type="date"
                          value={row.plannedStart}
                          onChange={(e) => updateRow(row.rowId, { plannedStart: e.target.value })}
                          className="h-8 w-36 text-xs"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          type="date"
                          value={row.plannedFinish}
                          onChange={(e) => updateRow(row.rowId, { plannedFinish: e.target.value })}
                          className="h-8 w-36 text-xs"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {stage === "done" && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="text-lg font-semibold text-success">
              {importedCount} activit{importedCount === 1 ? "y" : "ies"} added
            </p>
            <p className="text-sm text-muted-foreground">
              The Master Schedule and every lookahead/weekly/daily view now reflect this
              import.
            </p>
          </div>
        )}

        <DialogFooter>
          {stage === "review" && (
            <>
              <Button variant="outline" onClick={reset}>
                Start Over
              </Button>
              <Button onClick={handleConfirmImport} disabled={readyCount === 0}>
                Import {readyCount} Activit{readyCount === 1 ? "y" : "ies"}
              </Button>
            </>
          )}
          {stage === "done" && <Button onClick={() => onOpenChange(false)}>Done</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
