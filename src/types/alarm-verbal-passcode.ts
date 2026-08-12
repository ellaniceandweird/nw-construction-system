import type { BaseEntity } from "@/types/common";

/** Verbal passcode given to the alarm monitoring company to verify identity over the phone — kept separate from physical door/access Key Codes. */
export interface AlarmVerbalPasscode extends BaseEntity {
  propertyId?: string;
  propertyName: string;
  verbalPasscode: string;
  notes?: string;
}
