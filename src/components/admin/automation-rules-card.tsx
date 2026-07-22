"use client";

import * as React from "react";
import { CheckCircle2, Clock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAutomationRules } from "@/hooks/use-automation-rules";
import { updateAutomationRules } from "@/lib/settings/automation-rules-store";

const LIVE_RULES = [
  "A Purchase Order is created automatically the moment a quote is marked Awarded on the Quotes tab.",
  "Cost Ledger entries are generated automatically from every Purchase Order — no manual re-entry.",
  "Quotes are automatically tagged with who needs to approve them, based on cost.",
  "Change Orders over the threshold below are automatically flagged \"Requires Owner Approval.\"",
];

const PLANNED_RULES = [
  "Notify when a maintenance task has been open more than 14 days",
  "Notify when a vendor invoice is due within 3 days",
  "Auto-flag a project as \"behind schedule\" when 3+ activities are late",
];

export function AutomationRulesCard() {
  const rules = useAutomationRules();
  const [draft, setDraft] = React.useState(rules);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    setDraft(rules);
  }, [rules]);

  function handleSave() {
    updateAutomationRules(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="size-4 text-success" /> Already Automated
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            {LIVE_RULES.map((rule) => (
              <li key={rule} className="flex items-start gap-2">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-success" />
                {rule}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Approval Thresholds</CardTitle>
          <p className="text-xs text-muted-foreground">
            Who signs off on what, based on dollar amount. Change these here — nothing to
            edit in code.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <Label htmlFor="coThreshold">Change Order — Requires Owner Approval Above ($)</Label>
            <Input
              id="coThreshold"
              type="number"
              className="mt-1.5 max-w-xs"
              value={draft.changeOrderApprovalThreshold}
              onChange={(e) => setDraft({ ...draft, changeOrderApprovalThreshold: Number(e.target.value) || 0 })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="tier1Threshold">Quote Approval — Tier 1 Up To ($)</Label>
              <Input
                id="tier1Threshold"
                type="number"
                className="mt-1.5"
                value={draft.quoteApprovalTier1Threshold}
                onChange={(e) => setDraft({ ...draft, quoteApprovalTier1Threshold: Number(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="tier1Approvers">Approvers</Label>
              <Input
                id="tier1Approvers"
                className="mt-1.5"
                value={draft.tier1Approvers}
                onChange={(e) => setDraft({ ...draft, tier1Approvers: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="tier2Threshold">Quote Approval — Tier 2 Up To ($)</Label>
              <Input
                id="tier2Threshold"
                type="number"
                className="mt-1.5"
                value={draft.quoteApprovalTier2Threshold}
                onChange={(e) => setDraft({ ...draft, quoteApprovalTier2Threshold: Number(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="tier2Approvers">Approvers</Label>
              <Input
                id="tier2Approvers"
                className="mt-1.5"
                value={draft.tier2Approvers}
                onChange={(e) => setDraft({ ...draft, tier2Approvers: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tier3Approvers">Quote Approval — Above Tier 2 ($) — Approvers</Label>
            <Input
              id="tier3Approvers"
              className="mt-1.5 max-w-xs"
              value={draft.tier3Approvers}
              onChange={(e) => setDraft({ ...draft, tier3Approvers: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button size="sm" onClick={handleSave}>Save Changes</Button>
            {saved && <span className="text-sm text-success">Saved!</span>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="size-4 text-muted-foreground" /> Planned
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            These need real notification delivery (email/in-app alerts) behind them, which
            doesn&apos;t exist yet.
          </p>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            {PLANNED_RULES.map((rule) => (
              <li key={rule} className="flex items-start gap-2">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground" />
                {rule}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
