import { PSITS_ROLES } from "@/features/admin/constants/adminAccess";
import type { PsitsRole } from "@/features/admin/constants/adminAccess";

export type SettingsTab = "membership" | "account";

export interface Officer {
  _id?: string;
  id_number: string;
  name: string;
  campus: string;
  position?: string;
  access: PsitsRole;
  [key: string]: unknown;
}

export const ACCESS_LEVEL_KEYS = ["ADMIN", "DEVELOPER", "HEAD_FINANCE", "FINANCE", "EXECUTIVE", "STANDARD", "NO_ACCESS"] as const;
export type AccessLevelKey = (typeof ACCESS_LEVEL_KEYS)[number];
export type DisplayAccessLabel = "Admin" | "Developer" | "Head Finance" | "Finance" | "Executive" | "Standard" | "None";

const LABEL_TO_PSITS: Record<string, PsitsRole> = {
  "Admin": PSITS_ROLES.ADMIN,
  "Developer": PSITS_ROLES.DEVELOPER,
  "Head Finance": PSITS_ROLES.HEAD_FINANCE,
  "Finance": PSITS_ROLES.FINANCE,
  "Executive": PSITS_ROLES.EXECUTIVE,
  "Standard": PSITS_ROLES.STANDARD,
  "None": PSITS_ROLES.NO_ACCESS,
};

const PSITS_TO_LABEL: Record<PsitsRole, DisplayAccessLabel> = {
  [PSITS_ROLES.ADMIN]: "Admin",
  [PSITS_ROLES.DEVELOPER]: "Developer",
  [PSITS_ROLES.HEAD_FINANCE]: "Head Finance",
  [PSITS_ROLES.FINANCE]: "Finance",
  [PSITS_ROLES.EXECUTIVE]: "Executive",
  [PSITS_ROLES.STANDARD]: "Standard",
  [PSITS_ROLES.NO_ACCESS]: "None",
};

export { LABEL_TO_PSITS, PSITS_TO_LABEL };
