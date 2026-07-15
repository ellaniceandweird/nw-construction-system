import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FolderKanban,
  CalendarRange,
  ClipboardList,
  Wrench,
  ShoppingCart,
  Calculator,
  Wallet,
  FileText,
  Building2,
  Users,
  BarChart3,
  Sparkles,
  Settings,
} from "lucide-react";
import type { Role } from "@/types/roles";

export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Roles allowed to see this item. Omit = visible to everyone. */
  roles?: Role[];
  /** Expandable sub-items shown when the parent is active or toggled open. */
  children?: NavChild[];
}

/**
 * Primary sidebar navigation.
 *
 * Restructured to match the approved reference design (dark sidebar with
 * grouped sub-navigation). Every module from the original brief is still
 * present:
 *  - "Planning" = the Scheduling module (SDS §6), renamed to match the
 *    reference's own label for the Master Schedule + lookahead hierarchy.
 *  - "Daily Logs" = the primary day-to-day entry point into Field
 *    Operations (SDS §7); the full module (crew, equipment, safety,
 *    quality) still lives at this route.
 *  - Estimating and Documents keep their own top-level entries — the
 *    reference image doesn't show them, but both are substantial SDS
 *    modules (§9, §11) that don't fit naturally inside another item.
 *  - Automation and Admin/Security are folded into Settings, matching how
 *    the reference's own Settings panel lists "Automation Rules" and
 *    "Users & Permissions" as configuration sections rather than separate
 *    top-level modules.
 *  - Property Mgmt and Contacts are new items from the reference design,
 *    not in the original SDS module list.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  {
    label: "Planning",
    href: "/scheduling/master",
    icon: CalendarRange,
    children: [
      { label: "Master Schedule", href: "/scheduling/master" },
      { label: "16-Week Lookahead", href: "/scheduling/lookahead-16" },
      { label: "4-Week Lookahead", href: "/scheduling/lookahead-4" },
      { label: "Weekly Schedule", href: "/scheduling/weekly" },
      { label: "Daily Work Plan", href: "/scheduling/daily" },
    ],
  },
  { label: "Daily Logs", href: "/field-operations", icon: ClipboardList },
  {
    label: "Maintenance",
    href: "/maintenance",
    icon: Wrench,
    children: [
      { label: "General Maintenance", href: "/maintenance?tab=general" },
      { label: "Recurring Maintenance", href: "/maintenance?tab=recurring" },
      { label: "Maintenance Log", href: "/maintenance?tab=log" },
    ],
  },
  {
    label: "Procurement",
    href: "/procurement",
    icon: ShoppingCart,
    children: [
      { label: "Forecast", href: "/procurement?tab=forecast" },
      { label: "Material Request", href: "/procurement?tab=mrs" },
      { label: "RFQs", href: "/procurement?tab=rfqs" },
      { label: "Quotes", href: "/procurement?tab=quotes" },
      { label: "Quote Comparison", href: "/procurement?tab=comparison" },
      { label: "Purchase Order", href: "/procurement?tab=pos" },
      { label: "Vendors", href: "/procurement?tab=vendors" },
      { label: "Subcontractor", href: "/procurement?tab=subcontractors" },
    ],
  },
  {
    label: "Estimating & Budgeting",
    href: "/estimating",
    icon: Calculator,
    children: [
      { label: "Estimates", href: "/estimating?tab=estimates" },
      { label: "Takeoff", href: "/estimating?tab=takeoff" },
      { label: "Cost Codes", href: "/estimating?tab=costcodes" },
      { label: "Cost Database", href: "/estimating?tab=costdatabase" },
      { label: "Cost Tracking", href: "/estimating?tab=costtracking" },
    ],
  },
  { label: "Financial", href: "/financial", icon: Wallet },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Property Mgmt", href: "/properties", icon: Building2 },
  { label: "Contacts", href: "/contacts", icon: Users },
  { label: "Reports", href: "/reporting", icon: BarChart3 },
  { label: "AI Assistant", href: "/ai", icon: Sparkles },
  {
    label: "Settings",
    href: "/admin",
    icon: Settings,
    roles: ["system_administrator"],
  },
];
