import { useState } from "react";
import { Check, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Officer, AccessLevelKey } from "../types/settings.types";
import { PSITS_ROLES } from "@/features/admin/constants/adminAccess";
import type { PsitsRole } from "@/features/admin/constants/adminAccess";

interface OfficerTableProps {
  officers: Officer[];
  isLoading: boolean;
  isAdminAccess: boolean;
  currentAccess: string | undefined;
  onAccessChange: (id_number: string, newAccess: PsitsRole) => void;
  roleFilter: string;
  onRoleFilterChange: (filter: string) => void;
}

const canEditAccess = (currentUserAccess: string | undefined, officerAccess: PsitsRole): boolean => {
  if (currentUserAccess === PSITS_ROLES.ADMIN) return true;
  if (currentUserAccess === PSITS_ROLES.FINANCE && (officerAccess === PSITS_ROLES.NO_ACCESS || officerAccess === PSITS_ROLES.STANDARD)) return true;
  if (currentUserAccess === PSITS_ROLES.EXECUTIVE && (officerAccess === PSITS_ROLES.NO_ACCESS || officerAccess === PSITS_ROLES.STANDARD)) return true;
  return false;
};

const ROLE_FILTER_OPTIONS: Array<{ value: AccessLevelKey | "all"; label: string }> = [
  { value: "all", label: "All Roles" },
  { value: "ADMIN", label: "Admin" },
  { value: "FINANCE", label: "Finance" },
  { value: "EXECUTIVE", label: "Executive" },
  { value: "STANDARD", label: "Standard" },
  { value: "NO_ACCESS", label: "None" },
];

const DISPLAY_LABELS: Record<string, string> = {
  [PSITS_ROLES.ADMIN]: "Admin",
  [PSITS_ROLES.DEVELOPER]: "Developer",
  [PSITS_ROLES.HEAD_FINANCE]: "Head Finance",
  [PSITS_ROLES.FINANCE]: "Finance",
  [PSITS_ROLES.EXECUTIVE]: "Executive",
  [PSITS_ROLES.STANDARD]: "Standard",
  [PSITS_ROLES.NO_ACCESS]: "None",
};

export const OfficerTable = ({
  officers,
  isLoading,
  isAdminAccess,
  currentAccess,
  onAccessChange,
  roleFilter,
  onRoleFilterChange,
}: OfficerTableProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftAccess, setDraftAccess] = useState<PsitsRole | "">("");

  return (
    <div className="space-y-4">
      {/* Role Filter */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-[#858585]" />
        <Select value={roleFilter} onValueChange={onRoleFilterChange}>
          <SelectTrigger className="h-8 w-[180px] rounded-lg border-[#ececec] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b bg-[#efefef] text-left text-sm text-[#2f2f2f]">
              <th className="w-12 px-3 py-2 font-medium">Select</th>
              <th className="px-3 py-2 font-medium">ID</th>
              <th className="px-3 py-2 font-medium">Officer Name</th>
              <th className="px-3 py-2 font-medium">Campus</th>
              <th className="px-3 py-2 font-medium">Position</th>
              <th className="px-3 py-2 font-medium">Current Access</th>
              <th className="px-3 py-2 font-medium">Change Access</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }, (_, i) => (
                <tr key={i} className="border-b border-[#ededed]">
                  {Array.from({ length: 7 }, (_, j) => (
                    <td key={j} className="px-3 py-2">
                      <Skeleton className="h-4 w-full rounded-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : officers.length > 0 ? (
              officers.map((officer) => (
                <tr key={officer.id_number} className="border-b border-[#ededed]">
                  <td className="px-3 py-2">
                    <Checkbox aria-label={`Select ${officer.name}`} />
                  </td>
                  <td className="px-3 py-2">{officer.id_number}</td>
                  <td className="px-3 py-2">{officer.name}</td>
                  <td className="px-3 py-2">{officer.campus}</td>
                  <td className="px-3 py-2">{officer.position || "-"}</td>
                  <td className="px-3 py-2">
                    {DISPLAY_LABELS[officer.access] || officer.access}
                  </td>
                  <td className="px-3 py-2">
                    {editingId === officer.id_number ? (
                      <div className="flex items-center gap-2">
                      <Select
                        value={draftAccess}
                        onValueChange={(v) => setDraftAccess(v as PsitsRole)}
                      >
                          <SelectTrigger className="h-8 w-[150px] rounded-lg border-[#ececec] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_FILTER_OPTIONS.filter((o) => o.value !== "all").map((level) => {
                              const psitsValue = PSITS_ROLES[level.value as keyof typeof PSITS_ROLES] as PsitsRole;
                              return (
                                <SelectItem
                                  key={level.value}
                                  value={psitsValue}
                                  disabled={!canEditAccess(currentAccess, psitsValue)}
                                  className={
                                    !canEditAccess(currentAccess, psitsValue)
                                      ? "text-gray-400"
                                      : ""
                                  }
                                >
                                  {level.label}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 rounded-full text-emerald-600 hover:bg-emerald-50"
                        onClick={() => {
                          if (draftAccess) {
                            onAccessChange(officer.id_number, draftAccess as PsitsRole);
                          }
                          setEditingId(null);
                        }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 rounded-full text-red-600 hover:bg-red-50"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 rounded-full text-xs"
                        disabled={!isAdminAccess}
                        onClick={() => {
                          setDraftAccess(officer.access as PsitsRole);
                          setEditingId(officer.id_number);
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-3 py-12 text-center text-sm text-[#777]">
                  No officers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
