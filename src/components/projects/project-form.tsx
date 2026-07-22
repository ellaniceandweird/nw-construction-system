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
import { createProject, updateProject, deleteProject } from "@/lib/projects/project-store";
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
  const [submitted, setSubmitted] = React.useState(false);
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
          propertyName: existingProject.propertyName ?? "",
          clientName: existingProject.clientName,
          billingEntityId: existingProject.billingEntityId,
          street: existingProject.address.street,
          city: existingProject.address.city,
          state: existingProject.address.state,
          zip: existingProject.address.zip,
          projectType: existingProject.projectType,
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
        },
  });

  const selectedTags = watch("tags") ?? [];

  function toggleTag(tag: string) {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setValue("tags", next, { shouldValidate: true });
  }

  function onSubmit(values: ProjectFormValues) {
    const input = {
      projectNumber: existingProject?.projectNumber ?? `${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      projectName: values.projectName,
      propertyName: values.propertyName || undefined,
      clientName: values.clientName,
      billingEntityId: values.billingEntityId,
      address: {
        street: values.street,
        city: values.city,
        state: values.state,
        zip: values.zip,
        country: "USA",
      },
      projectType: values.projectType,
      constructionCategory: existingProject?.constructionCategory ?? values.projectType,
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

    if (existingProject) {
      updateProject(existingProject.id, input);
    } else {
      createProject(input);
    }
    setSubmitted(true);
    setTimeout(() => router.push("/projects"), 800);
  }

  function handleDelete() {
    if (!existingProject) return;
    deleteProject(existingProject.id);
    router.push("/projects");
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
            <Label htmlFor="propertyName">Property Name (optional)</Label>
            <Input id="propertyName" className="mt-1.5" {...register("propertyName")} />
          </div>
          <div>
            <Label htmlFor="clientName">Client / Billing Entity Name</Label>
            <Input id="clientName" className="mt-1.5" {...register("clientName")} />
            {fieldError(errors.clientName?.message)}
          </div>
          <div>
            <Label>Billing Entity</Label>
            <Select
              value={watch("billingEntityId")}
              onValueChange={(v) => setValue("billingEntityId", v, { shouldValidate: true })}
            >
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue placeholder="Select billing entity" />
              </SelectTrigger>
              <SelectContent>
                {billingEntities.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.companyName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldError(errors.billingEntityId?.message)}
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="street">Street Address</Label>
            <Input id="street" className="mt-1.5" {...register("street")} />
            {fieldError(errors.street?.message)}
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" className="mt-1.5" {...register("city")} />
            {fieldError(errors.city?.message)}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" className="mt-1.5" maxLength={2} {...register("state")} />
              {fieldError(errors.state?.message)}
            </div>
            <div>
              <Label htmlFor="zip">ZIP</Label>
              <Input id="zip" className="mt-1.5" {...register("zip")} />
              {fieldError(errors.zip?.message)}
            </div>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="projectType">Project Type</Label>
            <Input
              id="projectType"
              className="mt-1.5"
              placeholder="e.g. Renovation"
              {...register("projectType")}
            />
            {fieldError(errors.projectType?.message)}
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
        <Button type="submit" disabled={isSubmitting}>
          {existingProject ? "Save Changes" : "Create Project"}
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
