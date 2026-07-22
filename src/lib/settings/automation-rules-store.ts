"use client";

const STORAGE_KEY = "project-nw:automation-rules";

export interface AutomationRulesConfig {
  changeOrderApprovalThreshold: number;
  quoteApprovalTier1Threshold: number;
  quoteApprovalTier2Threshold: number;
  tier1Approvers: string;
  tier2Approvers: string;
  tier3Approvers: string;
}

export const DEFAULT_AUTOMATION_RULES: AutomationRulesConfig = {
  changeOrderApprovalThreshold: 5000,
  quoteApprovalTier1Threshold: 1000,
  quoteApprovalTier2Threshold: 3000,
  tier1Approvers: "Sjaak",
  tier2Approvers: "Sjaak, Carlo",
  tier3Approvers: "Sjaak, Carlo, Ben",
};

type Listener = () => void;

let config: AutomationRulesConfig = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): AutomationRulesConfig {
  if (typeof window === "undefined") return DEFAULT_AUTOMATION_RULES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AUTOMATION_RULES;
    return { ...DEFAULT_AUTOMATION_RULES, ...(JSON.parse(raw) as Partial<AutomationRulesConfig>) };
  } catch {
    return DEFAULT_AUTOMATION_RULES;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeAutomationRules(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAutomationRulesSnapshot(): AutomationRulesConfig {
  return config;
}

export function updateAutomationRules(patch: Partial<AutomationRulesConfig>) {
  config = { ...config, ...patch };
  persist();
  emit();
}
