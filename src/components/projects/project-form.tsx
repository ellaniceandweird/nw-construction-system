"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useBillingEntities } from "@/hooks/use-billing-entities";
import { useProperties } from "@/hooks/use-properties";
import { createProject, updateProject, deleteProject } from "@/lib/projects/project-store";
import { showErrorToast } from "@/lib/toast/toast-store";
import {
  projectFormSchema,
  type ProjectFormValues,
} from "@/lib/validation/project-schema";
import type { Project } from "@/types";

const AVAILABLE_TAGS = [
  "residential",
  "commercial",
  "roofing",
  "exterior_renovation",
  "historic_restoration",
  "internal",
] as const;

function fieldError(message?: string) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

export function ProjectForm({ existingProject }: { existingProject?: Project }) {
  const router = useRouter();
  const billingEntities = useBillingEntities();
  const properties = useProperties();
  const [submitted, setSubmitted] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: existingProject
      ? {
          projectName: existingProject.projectName,
          propertyId: existingProject.propertyId,
          billingEntityId: existingProject.billingEntityId,
          projectDescription: existingProject.projectDescription ?? "",
          manualStatus: existingProject.manualStatus,
          startDate: existingProject.startDate,
          plannedCompletionDate: existingProject.plannedCompletionDate,
          approvedBudget: existingProject.approvedBudget,
          tags: existingProject.tags,
          notes: existingProject.notes ?? "",
        }
      : {
          manualStatus: "active",
          tags: [],
          approvedBudget: 0,
          notes: "",
          projectDescription: "",
        },
  });

  const selectedTags = watch("tags") ?? [];

  function handlePropertyChange(propertyId: string) {
    setValue("propertyId", propertyId, { shouldValidate: true });
    const property = properties.find((p) => p.id === propertyId);
    setValue("billingEntityId", property?.billingEntityId ?? "", { shouldValidate: true });
  }

  function toggleTag(tag: string) {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setValue("tags", next, { shouldValidate: true });
  }

  async function onSubmit(values: ProjectFormValues) {
    const property = properties.find((p) => p.id === values.propertyId);
    const entity = billingEntities.find((b) => b.id === values.billingEntityId);
    const input = {
      projectNumber: existingProject?.projectNumber ?? `${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      projectName: values.projectName,
      propertyId: values.propertyId,
      propertyName: property?.name ?? existingProject?.propertyName ?? "",
      clientName: entity?.companyName ?? existingProject?.clientName ?? "",
      billingEntityId: values.billingEntityId,
      address: {
        street: property?.address ?? existingProject?.address.street ?? "",
        city: property?.town ?? existingProject?.address.city ?? "",
        state: existingProject?.address.state ?? "NY",
        zip: existingProject?.address.zip ?? "",
        country: "USA",
      },
      projectDescription: values.projectDescription || undefined,
      constructionCategory: existingProject?.constructionCategory ?? "Renovation",
      contractType: existingProject?.contractType ?? "Time & Materials",
      currentPhase: existingProject?.currentPhase ?? "construction",
      manualStatus: values.manualStatus,
      calculatedStatus: values.manualStatus,
      priority: existingProject?.priority ?? "medium",
      startDate: values.startDate,
      plannedCompletionDate: values.plannedCompletionDate,
      estimatedContractValue: existingProject?.estimatedContractValue ?? values.approvedBudget,
      approvedBudget: values.approvedBudget,
      tags: values.tags as Project["tags"],
      notes: values.notes || undefined,
    };

    setSaving(true);
    const result = existingProject
      ? await updateProject(existingProject.id, input)
      : await createProject(input);
    setSaving(false);

    if (!result.ok) {
      showErrorToast(result.error ? `Couldn't save: ${result.error}` : "Couldn't save this project — check your connection and try again.");
      return;
    }
    setSubmitted(true);
    setTimeout(() => router.push("/projects"), 800);
  }

  function handleDelete() {
    if (!existingProject) return;
    const id = existingProject.id;
    // Navigate away first, then delete — otherwise this page notices the
    // project vanish from underneath it and shows "not found" before the
    // redirect finishes.
    router.push("/projects");
    setTimeout(() => deleteProject(id), 300);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Card>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input id="projectName" className="mt-1.5" {...register("projectName")} />
            {fieldError(errors.projectName?.message)}
          </div>

          <div>
            <Label>Property</Label>
            <Select
              value={watch("propertyId")}
              onValueChange={handlePropertyChange}
            >
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldError(errors.propertyId?.message)}
          </div>
          <div>
            <Label>Billing Entity</Label>
            <div className="mt-1.5 flex h-9 items-center rounded-lg border border-input bg-muted/40 px-3 text-sm text-foreground">
              {billingEntities.find((b) => b.id === watch("billingEntityId"))?.companyName ?? (
                <span className="text-muted-foreground">Select a property first</span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Every property bills through one dedicated entity — this is set in References, not here.</p>
            {fieldError(errors.billingEntityId?.message)}
          </div>

          <div className="sm:col-span-2">
            <Label>Address</Label>
            <div className="mt-1.5 flex min-h-9 items-center rounded-lg border border-input bg-muted/40 px-3 py-2 text-sm text-foreground">
              {(() => {
                const property = properties.find((p) => p.id === watch("propertyId"));
                if (!property) return <span className="text-muted-foreground">Select a property first</span>;
                return [property.address, property.town].filter(Boolean).join(", ") || (
                  <span className="text-muted-foreground">No address on file for this property yet</span>
                );
              })()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Pulled from the property record — edit it in References {"->"} Billing Entities, not here.
            </p>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="projectDescription">Project Description</Label>
            <Textarea
              id="projectDescription"
              className="mt-1.5"
              placeholder="What's this project about?"
              {...register("projectDescription")}
            />
            {fieldError(errors.projectDescription?.message)}
          </div>

          <div>
            <Label>Status</Label>
            <Select
              value={watch("manualStatus")}
              onValueChange={(v) => setValue("manualStatus", v as ProjectFormValues["manualStatus"], { shouldValidate: true })}
            >
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input id="startDate" type="date" className="mt-1.5" {...register("startDate")} />
            {fieldError(errors.startDate?.message)}
          </div>
          <div>
            <Label htmlFor="plannedCompletionDate">Target Completion Date</Label>
            <Input
              id="plannedCompletionDate"
              type="date"
              className="mt-1.5"
              {...register("plannedCompletionDate")}
            />
            {fieldError(errors.plannedCompletionDate?.message)}
          </div>

          <div>
            <Label htmlFor="approvedBudget">Approved Budget ($)</Label>
            <Input
              id="approvedBudget"
              type="number"
              className="mt-1.5"
              {...register("approvedBudget")}
            />
            {fieldError(errors.approvedBudget?.message)}
          </div>

          <div className="sm:col-span-2">
            <Label>Tags</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={
                    selectedTags.includes(tag)
                      ? "rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                      : "rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-accent"
                  }
                >
                  {tag.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" className="mt-1.5" {...register("notes")} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting || saving}>
          {saving ? "Saving…" : existingProject ? "Save Changes" : "Create Project"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/projects")}>
          Cancel
        </Button>
        {existingProject && !confirmingDelete && (
          <Button
            type="button"
            variant="ghost"
            className="ml-auto text-destructive hover:text-destructive"
            onClick={() => setConfirmingDelete(true)}
          >
            <Trash2 className="size-3.5" /> Delete Project
          </Button>
        )}
        {existingProject && confirmingDelete && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Delete this project?</span>
            <Button type="button" variant="destructive" size="sm" onClick={handleDelete}>
              Confirm Delete
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setConfirmingDelete(false)}>
              Cancel
            </Button>
          </div>
        )}
        {submitted && (
          <span className="text-sm text-success">
            Saved! Redirecting…
          </span>
        )}
      </div>
    </form>
  );
}
