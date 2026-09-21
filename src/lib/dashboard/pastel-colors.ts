/**
 * The single source of truth for dashboard status colors. Every
 * dashboard (Executive, Financial, Maintenance, Procurement, Planning)
 * imports from here — never redefine these hex values locally, or the
 * color meanings will drift out of sync across dashboards.
 *
 * Meaning stays fixed everywhere: green = good/on track, amber = needs
 * attention, coral = critical/overdue, blue = neutral/budget info,
 * purple = a secondary category (used only when a chart needs one more
 * distinct color beyond the four status colors, e.g. vendor spend).
 */
export const DASHBOARD_COLORS = {
  good: { bg: "#EAF3DE", text: "#3B6D11", textDark: "#173404", fill: "#C0DD97" },
  attention: { bg: "#FAEEDA", text: "#854F0B", textDark: "#412402", fill: "#FAC775" },
  critical: { bg: "#FCEBEB", text: "#A32D2D", textDark: "#501313", fill: "#F7C1C1" },
  info: { bg: "#E6F1FB", text: "#0C447C", textDark: "#042C53", fill: "#B5D4F4" },
  secondary: { bg: "#EEEDFE", text: "#3C3489", textDark: "#26215C", fill: "#CECBF6" },
} as const;

export type DashboardColorKey = keyof typeof DASHBOARD_COLORS;

/** Recharts-ready fill array in a fixed order, for charts with several categorical slices (e.g. cost-by-category). */
export const DASHBOARD_CHART_FILLS = [
  DASHBOARD_COLORS.info.fill,
  DASHBOARD_COLORS.good.fill,
  DASHBOARD_COLORS.secondary.fill,
  DASHBOARD_COLORS.attention.fill,
  DASHBOARD_COLORS.critical.fill,
];
