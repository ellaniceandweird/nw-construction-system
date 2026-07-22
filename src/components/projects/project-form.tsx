"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
  const [submitted, setSubmitted] = React.useState(false);

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
          street: existingProject.address.street,
          city: existingProject.address.city,
          state: existingProject.address.state,
          zip: existingProject.address.zip,
          projectType: existingProject.projectType,
          contractType: existingProject.contractType,
          priority: existingProject.priority,
          startDate: existingProject.startDate,
          plannedCompletionDate: existingProject.plannedCompletionDate,
          estimatedContractValue: existingProject.estimatedContractValue,
          approvedBudget: existingProject.approvedBudget,
          tags: existingProject.tags,
          notes: existingProject.notes ?? "",
        }
      : {
          priority: "medium",
          tags: [],
          estimatedContractValue: 0,
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
    // No backend yet — Excel read/write arrives in Phase 8. For now this
    // proves the form validates correctly end-to-end and shows what would
    // be saved.
    console.log("Project form submitted (not yet persisted):", values);
    setSubmitted(true);
    setTimeout(() => router.push("/projects"), 1200);
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
            <Label htmlFor="clientName">Client / Billing Entity</Label>
            <Input id="clientName" className="mt-1.5" {...register("clientName")} />
            {fieldError(errors.clientName?.message)}
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

          <div>
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
            <Label htmlFor="contractType">Contract Type</Label>
            <Input
              id="contractType"
              className="mt-1.5"
              placeholder="e.g. Time & Materials"
              {...register("contractType")}
            />
            {fieldError(errors.contractType?.message)}
          </div>

          <div>
            <Label>Priority</Label>
            <Select
              value={watch("priority")}
              onValueChange={(v) => setValue("priority", v as ProjectFormValues["priority"], { shouldValidate: true })}
            >
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div />

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
            <Label htmlFor="estimatedContractValue">Estimated Contract Value ($)</Label>
            <Input
              id="estimatedContractValue"
              type="number"
              className="mt-1.5"
              {...register("estimatedContractValue")}
            />
            {fieldError(errors.estimatedContractValue?.message)}
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
        {submitted && (
          <span className="text-sm text-success">
            Saved locally — Excel sync arrives in Phase 8. Redirecting…
          </span>
        )}
      </div>
    </form>
  );
}
