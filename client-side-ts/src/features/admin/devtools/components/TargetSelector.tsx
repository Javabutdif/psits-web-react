import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchOfficers } from "@/features/admin/settings/api/settings.api";
import type { Officer } from "@/features/admin/settings/types/settings.types";

interface TargetSelectorProps {
  value: { type: string; ids: string[] };
  onChange: (value: { type: string; ids: string[] }) => void;
}

export const TargetSelector = ({ value, onChange }: TargetSelectorProps) => {
  const targetType = value.type as "admin" | "role" | "permission";
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [officerSearch, setOfficerSearch] = useState("");
  const [officersLoaded, setOfficersLoaded] = useState(false);

  useEffect(() => {
    if (targetType === "admin" && !officersLoaded) {
      fetchOfficers()
        .then((data) => {
          if (Array.isArray(data)) setOfficers(data);
        })
        .finally(() => setOfficersLoaded(true));
    }
  }, [targetType, officersLoaded]);

  const roleOptions = [
    { value: "PSITS_ADMIN", label: "Admin" },
    { value: "PSITS_EXEC", label: "Executive" },
    { value: "PSITS_HEAD_FINANCE", label: "Head Finance" },
    { value: "PSITS_FINANCE", label: "Finance" },
  ];

  const handleChange = (newType: string) => {
    onChange({ type: newType as "admin" | "role" | "permission", ids: [] });
  };

  const toggleOfficer = (idNumber: string) => {
    const ids: string[] = value.ids.includes(idNumber)
      ? value.ids.filter((id) => id !== idNumber)
      : [...value.ids, idNumber];
    onChange({ type: targetType, ids });
  };

  const filteredOfficers = officers.filter((o) =>
    `${o.name} ${o.id_number} ${o.position ?? ""}`.toLowerCase().includes(officerSearch.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-[#555]">Target Type</label>
        <Select value={targetType} onValueChange={handleChange}>
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="Select target type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Specific Admin(s)</SelectItem>
            <SelectItem value="role">By Role</SelectItem>
            <SelectItem value="permission">By Permission Level</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {targetType === "role" && (
        <div>
          <label className="text-xs font-medium text-[#555]">Roles</label>
          <div className="mt-1 space-y-1">
            {roleOptions.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-sm text-[#333]">
                <input
                  type="checkbox"
                  checked={value.ids.includes(opt.value)}
                  onChange={(e) => {
                    const ids: string[] = e.target.checked
                      ? [...value.ids, opt.value]
                      : value.ids.filter((id: string) => id !== opt.value);
                    onChange({ type: targetType, ids });
                  }}
                  className="rounded border-gray-300"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      )}

      {targetType === "permission" && (
        <div>
          <label className="text-xs font-medium text-[#555]">Permission Levels</label>
          <div className="mt-1 space-y-1">
            {[
              { value: "PSITS_ADMIN", label: "Admin (President)" },
              { value: "PSITS_EXEC", label: "Executive" },
              { value: "PSITS_HEAD_FINANCE", label: "Head Finance" },
              { value: "PSITS_FINANCE", label: "Finance" },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-sm text-[#333]">
                <input
                  type="checkbox"
                  checked={value.ids.includes(opt.value)}
                  onChange={(e) => {
                    const ids = e.target.checked
                      ? [...value.ids, opt.value]
                      : value.ids.filter((id: string) => id !== opt.value);
                    onChange({ type: targetType, ids });
                  }}
                  className="rounded border-gray-300"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      )}

      {targetType === "admin" && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-[#555]">Admins</label>
          <input
            type="text"
            placeholder="Search by name, ID, or position..."
            value={officerSearch}
            onChange={(e) => setOfficerSearch(e.target.value)}
            className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm outline-none focus:border-[#1c9dde]"
          />
          <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-[#e5e5e5]">
            {officersLoaded && filteredOfficers.length === 0 ? (
              <p className="px-3 py-2 text-xs text-[#8a8a8a]">No officers found.</p>
            ) : (
              filteredOfficers.map((officer) => (
                <label
                  key={officer.id_number}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-[#333] hover:bg-[#f9f9f9]"
                >
                  <Checkbox
                    checked={value.ids.includes(officer.id_number)}
                    onCheckedChange={() => toggleOfficer(officer.id_number)}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{officer.name}</span>
                    <span className="text-xs text-[#8a8a8a]">
                      {officer.id_number}
                      {officer.position ? ` · ${officer.position}` : ""}
                    </span>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
