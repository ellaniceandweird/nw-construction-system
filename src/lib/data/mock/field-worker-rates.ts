import type { FieldWorkerRate } from "@/types/references";

/**
 * ILLUSTRATIVE hourly rates — the 8 employee IDs/names are real (pulled
 * from actual Daily Logs crew attendance), but the rates themselves are
 * placeholder numbers, not real payroll data.
 */
export const MOCK_FIELD_WORKER_RATES: FieldWorkerRate[] = [
  { id: "RATE-000001", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z", lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z", revisionNumber: 1, module: "References", status: "active", employeeId: "EMP-000001", employeeName: "Pedro (Lead)", trade: "Field Supervision", hourlyRate: 38, overtimeRate: 57, defaultCostCode: "01090" },
  { id: "RATE-000002", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z", lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z", revisionNumber: 1, module: "References", status: "active", employeeId: "EMP-000002", employeeName: "Federico Taquez Jolon", trade: "Demolition", hourlyRate: 28, overtimeRate: 42, defaultCostCode: "02010" },
  { id: "RATE-000003", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z", lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z", revisionNumber: 1, module: "References", status: "active", employeeId: "EMP-000003", employeeName: "Brandon Alexander Xoc Bucu", trade: "Windows", hourlyRate: 30, overtimeRate: 45, defaultCostCode: "085000" },
  { id: "RATE-000004", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z", lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z", revisionNumber: 1, module: "References", status: "active", employeeId: "EMP-000004", employeeName: "Jose Alfredo Yucute Bucu", trade: "Site Preparation", hourlyRate: 26, overtimeRate: 39, defaultCostCode: "02010" },
  { id: "RATE-000005", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z", lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z", revisionNumber: 1, module: "References", status: "active", employeeId: "EMP-000005", employeeName: "Margarito Vicente Sontay", trade: "Site Preparation", hourlyRate: 26, overtimeRate: 39, defaultCostCode: "02010" },
  { id: "RATE-000006", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z", lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z", revisionNumber: 1, module: "References", status: "active", employeeId: "EMP-000006", employeeName: "Angel Francisco Garcia Bacquiax", trade: "Carpentry", hourlyRate: 29, overtimeRate: 43.5, defaultCostCode: "061000" },
  { id: "RATE-000007", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z", lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z", revisionNumber: 1, module: "References", status: "active", employeeId: "EMP-000007", employeeName: "Fredy Josue Cuc Choxin", trade: "Carpentry", hourlyRate: 29, overtimeRate: 43.5, defaultCostCode: "061000" },
  { id: "RATE-000008", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z", lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z", revisionNumber: 1, module: "References", status: "active", employeeId: "EMP-000008", employeeName: "Alfredo Morales", trade: "General Labor", hourlyRate: 24, overtimeRate: 36, defaultCostCode: "01090" },
];
