import type { BaseEntity } from "@/types/common";

/**
 * Maintenance Module data models.
 *
 * This module was added outside the original SDS module list at the
 * user's request, to track recurring facilities maintenance (HVAC filters,
 * repairs, general upkeep) across ALL company properties — not just active
 * construction projects. A property here may or may not correspond to a
 * Project record; most maintenance work happens on buildings that aren't
 * under active construction at all.
 *
 * Kept deliberately separate from types/project.ts: a Project is a
 * construction job with a budget, schedule, and completion date. A
 * Property is a physical building the company owns/operates indefinitely.
 */

/** A physical property the company maintains, independent of any construction project. */
export interface Property extends BaseEntity {
  name: string; // e.g. "Kitty's/Mr Cat", "391 Main Street"
  address?: string;
  town?: string;
  billingEntityId?: string;
  relatedProjectId?: string; // set if a construction Project also exists for this property
  coverPhotoUrl?: string;
  /** Linked shared Google Drive folder for this property — the whole folder
   *  lives in Drive and stays in sync there; the app just keeps a shortcut
   *  to it rather than storing files itself (Sjaak's 2026-07-20 request). */
  googleDriveFolderUrl?: string;
  googleDriveFolderName?: string;
}

export type MaintenancePriority =
  | "high"
  | "medium"
  | "low"
  | "on_hold"
  | "long_term_project";

export type MaintenanceTaskStatus =
  | "working_on"
  | "not_started"
  | "stuck"
  | "complete";

/**
 * A single maintenance ticket — extracted from the real "Maintenance To-Do
 * List". Deliberately lightweight compared to a construction Activity:
 * no WBS, no dependencies, no crew resourcing — just a task, an owner, and
 * a status, matching how the business actually tracks this work today.
 */
export interface MaintenanceTask extends BaseEntity {
  propertyId?: string;
  propertyName?: string; // kept for cases with no matching Property record
  taskDescription: string;
  priority?: MaintenancePriority;
  taskStatus: MaintenanceTaskStatus;
  dateEntered: string;
  plannedCompletionDate?: string;
  dateCompleted?: string;
  responsibleParty?: string; // "Ball In Court"
  updateNotes?: string;
  comments?: string;
}

/**
 * A recurring piece of equipment (HVAC unit, filter, water filter, etc.)
 * and its maintenance cadence — extracted from the real HVAC/Filter Log.
 */
export interface EquipmentMaintenanceSchedule extends BaseEntity {
  propertyId?: string;
  propertyName: string;
  location: string; // e.g. "Mr Cat Restaurant", "DOAS", "Attic"
  systemType: string; // e.g. "(2) 1-1 mini splits", "Roof top unit"
  maintenanceNeeded?: string;
  frequency?: string; // e.g. "3-months", "twice a year" — free text from source
  lastCompleted?: string;
  notes?: string;
}

/** A logged instance of maintenance work actually performed (HVAC log's second table). */
export interface MaintenanceWorkLogEntry extends BaseEntity {
  propertyId?: string;
  propertyName: string;
  dateOfWork?: string;
  location?: string;
  workPerformed: string;
  notes?: string;
}

/** Paint colors used at each property/room, so a touch-up always matches exactly. Transcribed from the Master Paint Spreadsheet. */
export interface PaintLogEntry extends BaseEntity {
  propertyId?: string;
  propertyName: string;
  propertyAddress?: string;
  location: string; // e.g. "Kitchen", "Exterior Siding"
  location2?: string; // e.g. "Wall & Ceiling", "1st Coat", "Final Coat"
  brand?: string; // e.g. "Benjamin Moore"
  productType?: string; // e.g. "Regal Select", "Element Guard"
  finish?: string; // e.g. "Eggshell", "Semi Gloss"
  color?: string; // e.g. "Decorators White"
  colorCode?: string; // custom mix formula/code, sometimes multi-line
  comments?: string;
}

/** Key/lock/alarm codes per property, so a lost key or new hire's access can be sorted quickly. Transcribed from the Door Codes document. */
export interface KeyCodeEntry extends BaseEntity {
  propertyId?: string;
  propertyName: string;
  spaceName?: string; // tenant/space, e.g. "Made X", "Common"
  doorIdentifier: string; // e.g. "Spiral Stairwell", "Rear Exterior", "Alarm Passcode"
  accessCode?: string; // can hold multiple codes, e.g. "6168, 2038"
  notes?: string;
}
