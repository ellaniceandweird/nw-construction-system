import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FolderKanban,
  CalendarRange,
  HardHat,
  ShoppingCart,
  Calculator,
  Wallet,
  FileText,
  BarChart3,
  Sparkles,
  Workflow,
  ShieldCheck,
} from "lucide-react";
import type { Role } from "@/types/roles";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Roles allowed to see this item. Omit = visible to everyone. */
  roles?: Role[];
}

/**
 * Primary sidebar navigation.
 * Source: SDS Volume 7 §5.2 (Sidebar) — Dashboard, Projects, Scheduling,
 * Field Operations, Procurement, Estimating, Financial, Documents, Reports,
 * Administration — extended with AI and Automation per the module list
 * in the project brief.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Scheduling", href: "/scheduling/master", icon: CalendarRange },
  { label: "Field Operations", href: "/field-operations", icon: HardHat },
  { label: "Procurement", href: "/procurement", icon: ShoppingCart },
  { label: "Estimating", href: "/estimating", icon: Calculator },
  { label: "Financial", href: "/financial", icon: Wallet },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Reporting", href: "/reporting", icon: BarChart3 },
  { label: "AI Assistant", href: "/ai", icon: Sparkles },
  { label: "Automation", href: "/automation", icon: Workflow },
  {
    label: "Administration",
    href: "/admin",
    icon: ShieldCheck,
    roles: ["system_administrator"],
  },
];

/** Sub-navigation for the Scheduling module (SDS §6.3 Scheduling Hierarchy). */
export const SCHEDULING_SUBNAV = [
  { label: "Master Schedule", href: "/scheduling/master" },
  { label: "16-Week Lookahead", href: "/scheduling/lookahead-16" },
  { label: "4-Week Lookahead", href: "/scheduling/lookahead-4" },
  { label: "Weekly Schedule", href: "/scheduling/weekly" },
  { label: "Daily Work Plan", href: "/scheduling/daily" },
];
