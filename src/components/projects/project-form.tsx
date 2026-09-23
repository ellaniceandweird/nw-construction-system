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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useBillingEntities } from "@/hooks/use-billing-entities";
import { useProperties } from "@/hooks/use-properties";
import { getPropertyForProject } from "@/lib/properties/property-relations";
import { createProject, updateProject, deleteProject } from "@/lib/projects/project-store";
import { showErrorToast } from "@/lib/toast/toast-store";
import {
  projectFormSchema,
  type ProjectFormValues,
} from "@/lib/validation/project-schema";
import type { Project } from "@/types";

function fieldError(message?: string) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

const PHASE_OPTIONS: { value: NonNullable<ProjectFormValues["currentPhase"]>; label: string }[] = [
  { value: "opportunity", label: "Opportunity" },
  { value: "preconstruction", label: "Preconstruction" },
  { value: "estimating", label: "Estimating" },
  { value: "design_coordination", label: "Design Coordination" },
  { value: "procurement", label: "Procurement" },
  { value: "construction", label: "Construction" },
  { value: "commissioning", label: "Commissioning" },
  { value: "punch_list", label: "Punch List" },
  { value: "substantial_completion", label: "Substantial Completion" },
  { value: "closeout", label: "Closeout" },
  { value: "warranty", label: "Warranty" },
  { value: "archived", label: "Archived" },
];

const TEAM_FIELDS: { key: keyof ProjectFormValues; label: string }[] = [
  { key: "director", label: "Director" },
  { key: "operationsManager", label: "Operations Manager" },
  { key: "projectManager", label: "Project Manager" },
  { key: "projectEngineer", label: "Project Engineer" },
  { key: "superintendent", label: "Superintendent" },
  { key: "foreman", label: "Foreman" },
  { key: "procurementLead", label: "Procurement Lead" },
  { key: "estimator", label: "Estimator" },
];

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
          projectNumber: existingProject.projectNumber,
          projectName: existingProject.projectName,
          propertyId: existingProject.propertyId,
          billingEntityId: existingProject.billingEntityId,
          costCenter: existingProject.costCenter ?? "",
          internalProjectCode: existingProject.internalProjectCode ?? "",

          clientName: existingProject.clientName ?? "",
          owner: existingProject.owner ?? "",
          architect: existingProject.architect ?? "",
          engineer: existingProject.engineer ?? "",
          generalContractor: existingProject.generalContractor ?? "",
          primaryContact: existingProject.primaryContact ?? "",
          contactEmail: existingProject.contactEmail ?? "",
          contactPhone: existingProject.contactPhone ?? "",

          projectDescription: existingProject.projectDescription ?? "",
          constructionCategory: existingProject.constructionCategory ?? "",
          contractType: existingProject.contractType ?? "",
          currentPhase: existingProject.currentPhase,
          manualStatus: existingProject.manualStatus,
          priority: existingProject.priority,

          startDate: existingProject.startDate,
          plannedCompletionDate: existingProject.plannedCompletionDate,
          actualCompletionDate: existingProject.actualCompletionDate ?? "",

          estimatedContractValue: existingProject.estimatedContractValue,
          approvedBudget: existingProject.approvedBudget,

          director: existingProject.team?.director ?? "",
          operationsManager: existingProject.team?.operationsManager ?? "",
          projectManager: existingProject.team?.projectManager ?? "",
          projectEngineer: existingProject.team?.projectEngineer ?? "",
          superintendent: existingProject.team?.superintendent ?? "",
          foreman: existingProject.team?.foreman ?? "",
          procurementLead: existingProject.team?.procurementLead ?? "",
          estimator: existingProject.team?.estimator ?? "",

          manualCompletionPercent: existingProject.manualCompletionPercent != null ? String(existingProject.manualCompletionPercent) : "",
          notes: existingProject.notes ?? "",
        }
      : {
          manualStatus: "active",
          currentPhase: "preconstruction",
          priority: "medium",
          approvedBudget: 0,
          notes: "",
          projectDescription: "",
        },
  });

  // If this project's stored propertyId doesn't resolve to a real
  // property (missing link, predates Properties existing, etc.), fall
  // back to matching by address — same logic "Related Projects" uses
  // elsewhere — so the Property field (and therefore Billing Entity)
  // fills in correctly instead of silently staying blank/stale. Runs
  // once properties has actually loaded, not before.
  const fuzzyMatchedRef = React.useRef(false);
  React.useEffect(() => {
    if (!existingProject || properties.length === 0 || fuzzyMatchedRef.current) return;
    const currentPropertyId = watch("propertyId");
    const resolvesToRealProperty = properties.some((p) => p.id === currentPropertyId);
    if (resolvesToRealProperty) {
      fuzzyMatchedRef.current = true;
      return;
    }
    const matched = getPropertyForProject(existingProject, properties);
    fuzzyMatchedRef.current = true;
    if (matched) {
      setValue("propertyId", matched.id, { shouldValidate: true });
      setValue("billingEntityId", matched.billingEntityId ?? "", { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingProject, properties]);

  function handlePropertyChange(propertyId: string) {
    setValue("propertyId", propertyId, { shouldValidate: true });
    const property = properties.find((p) => p.id === propertyId);
    setValue("billingEntityId", property?.billingEntityId ?? "", { shouldValidate: true });
  }

  async function onSubmit(values: ProjectFormValues) {
    const property = properties.find((p) => p.id === values.propertyId);
    // Always re-derive billing entity fresh from whatever property is
    // currently selected — a project's stored billingEntityId can go
    // stale (e.g. if it predates this auto-fill, or the property's own
    // billing entity changed since), so this is the single source of
    // truth at save time rather than trusting old form/stored values.
    const derivedBillingEntityId = property?.billingEntityId || values.billingEntityId || existingProject?.billingEntityId || "";
    const input = {
      projectNumber: values.projectNumber || existingProject?.projectNumber || `${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      projectName: values.projectName || existingProject?.projectName || "Untitled Project",
      propertyId: values.propertyId || existingProject?.propertyId || "",
      propertyName: property?.name ?? property?.address ?? existingProject?.propertyName ?? "",
      billingEntityId: derivedBillingEntityId,
      costCenter: values.costCenter || undefined,
      internalProjectCode: values.internalProjectCode || undefined,

      clientName: values.clientName || existingProject?.clientName || "",
      owner: values.owner || undefined,
      architect: values.architect || undefined,
      engineer: values.engineer || undefined,
      generalContractor: values.generalContractor || undefined,
      primaryContact: values.primaryContact || undefined,
      contactEmail: values.contactEmail || undefined,
      contactPhone: values.contactPhone || undefined,

      address: {
        street: property?.address ?? existingProject?.address.street ?? "",
        city: property?.town ?? existingProject?.address.city ?? "",
        state: existingProject?.address.state ?? "NY",
        zip: existingProject?.address.zip ?? "",
        country: "USA",
      },
      projectDescription: values.projectDescription || undefined,
      constructionCategory: values.constructionCategory || existingProject?.constructionCategory || "Renovation",
      contractType: values.contractType || existingProject?.contractType || "Time & Materials",
      currentPhase: values.currentPhase ?? existingProject?.currentPhase ?? "construction",
      manualStatus: values.manualStatus ?? existingProject?.manualStatus ?? "active",
      calculatedStatus: values.manualStatus ?? existingProject?.calculatedStatus ?? "active",
      priority: values.priority ?? existingProject?.priority ?? "medium",
      startDate: values.startDate ?? "",
      plannedCompletionDate: values.plannedCompletionDate ?? "",
      actualCompletionDate: values.actualCompletionDate || undefined,
      estimatedContractValue: values.estimatedContractValue ?? existingProject?.estimatedContractValue ?? values.approvedBudget ?? 0,
      approvedBudget: values.approvedBudget ?? existingProject?.approvedBudget ?? 0,

      team: {
        director: values.director || undefined,
        operationsManager: values.operationsManager || undefined,
        projectManager: values.projectManager || undefined,
        projectEngineer: values.projectEngineer || undefined,
        superintendent: values.superintendent || undefined,
        foreman: values.foreman || undefined,
        procurementLead: values.procurementLead || undefined,
        estimator: values.estimator || undefined,
      },

      manualCompletionPercent:
        values.manualCompletionPercent && values.manualCompletionPercent.trim() !== ""
          ? Math.max(0, Math.min(100, parseFloat(values.manualCompletionPercent)))
          : null,
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
        <CardHeader><CardTitle>Identification</CardTitle></CardHeader>
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

          <div>
            <Label htmlFor="projectNumber">Project Number</Label>
            <Input id="projectNumber" className="mt-1.5" {...register("projectNumber")} />
          </div>
          <div>
            <Label htmlFor="costCenter">Cost Center (optional)</Label>
            <Input id="costCenter" className="mt-1.5" {...register("costCenter")} />
          </div>
          <div>
            <Label htmlFor="internalProjectCode">Internal Project Code (optional)</Label>
            <Input id="internalProjectCode" className="mt-1.5" {...register("internalProjectCode")} />
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Client Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="clientName">Client Name</Label>
            <Input id="clientName" className="mt-1.5" {...register("clientName")} />
          </div>
          <div>
            <Label htmlFor="owner">Owner (optional)</Label>
            <Input id="owner" className="mt-1.5" {...register("owner")} />
          </div>
          <div>
            <Label htmlFor="architect">Architect (optional)</Label>
            <Input id="architect" className="mt-1.5" {...register("architect")} />
          </div>
          <div>
            <Label htmlFor="engineer">Engineer (optional)</Label>
            <Input id="engineer" className="mt-1.5" {...register("engineer")} />
          </div>
          <div>
            <Label htmlFor="generalContractor">General Contractor (optional)</Label>
            <Input id="generalContractor" className="mt-1.5" {...register("generalContractor")} />
          </div>
          <div>
            <Label htmlFor="primaryContact">Primary Contact (optional)</Label>
            <Input id="primaryContact" className="mt-1.5" {...register("primaryContact")} />
          </div>
          <div>
            <Label htmlFor="contactEmail">Contact Email (optional)</Label>
            <Input id="contactEmail" type="email" className="mt-1.5" {...register("contactEmail")} />
          </div>
          <div>
            <Label htmlFor="contactPhone">Contact Phone (optional)</Label>
            <Input id="contactPhone" type="tel" className="mt-1.5" {...register("contactPhone")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Project Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <Label htmlFor="constructionCategory">Construction Category</Label>
            <Input id="constructionCategory" className="mt-1.5" placeholder="e.g. Renovation, New Build" {...register("constructionCategory")} />
          </div>
          <div>
            <Label htmlFor="contractType">Contract Type</Label>
            <Input id="contractType" className="mt-1.5" placeholder="e.g. Time & Materials, Fixed Price" {...register("contractType")} />
          </div>

          <div>
            <Label>Current Phase</Label>
            <Select
              value={watch("currentPhase")}
              onValueChange={(v) => setValue("currentPhase", v as ProjectFormValues["currentPhase"], { shouldValidate: true })}
            >
              <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PHASE_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Priority</Label>
            <Select
              value={watch("priority")}
              onValueChange={(v) => setValue("priority", v as ProjectFormValues["priority"], { shouldValidate: true })}
            >
              <SelectTrigger className="mt-1.5 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
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
                <SelectItem value="planning">Upcoming</SelectItem>
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
            <Label htmlFor="actualCompletionDate">Actual Completion Date (optional)</Label>
            <Input id="actualCompletionDate" type="date" className="mt-1.5" {...register("actualCompletionDate")} />
          </div>

          <div>
            <Label htmlFor="estimatedContractValue">Estimated Contract Value ($)</Label>
            <Input
              id="estimatedContractValue"
              type="number"
              className="mt-1.5"
              {...register("estimatedContractValue")}
            />
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
            <Label htmlFor="manualCompletionPercent">% Complete (optional override)</Label>
            <Input
              id="manualCompletionPercent"
              type="number"
              min={0}
              max={100}
              placeholder="Auto-calculated from activities"
              className="mt-1.5"
              {...register("manualCompletionPercent")}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Leave blank to use the automatic calculation from completed activities.
            </p>
            {fieldError(errors.manualCompletionPercent?.message)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Project Team</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {TEAM_FIELDS.map((f) => (
            <div key={f.key}>
              <Label htmlFor={f.key}>{f.label} (optional)</Label>
              <Input id={f.key} className="mt-1.5" {...register(f.key)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
        <CardContent>
          <Textarea id="notes" {...register("notes")} />
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
