import { useState } from "react";
import { getFunctions } from "../api/automation.api";
import type { AutomationFunction } from "../types/automation.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

interface FunctionRegistryProps {
  selectedKeys: string[];
  onSelect: (keys: string[]) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  inventory: "Inventory",
  orders: "Orders",
  members: "Members",
  events: "Events",
  system: "System",
  security: "Security",
};

export const FunctionRegistry = ({ selectedKeys, onSelect }: FunctionRegistryProps) => {
  const [functions, setFunctions] = useState<AutomationFunction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchFunctions = async () => {
    try {
      const res = await getFunctions();
      setFunctions(res.data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useState(() => {
    fetchFunctions();
  });

  const toggle = (key: string) => {
    const next = selectedKeys.includes(key)
      ? selectedKeys.filter((k) => k !== key)
      : [...selectedKeys, key];
    onSelect(next);
  };

  const filtered = functions.filter(
    (f) =>
      f.key.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, AutomationFunction[]>>((acc, f) => {
    if (!acc[f.category]) acc[f.category] = [];
    acc[f.category].push(f);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a8a8a]" />
        <input
          type="text"
          placeholder="Search functions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-[#e5e5e5] bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#1c9dde]"
        />
      </div>

      {Object.entries(grouped).map(([category, funcs]) => (
        <div key={category} className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8a8a8a]">
            {CATEGORY_LABELS[category] ?? category}
          </p>
          <div className="space-y-1">
            {funcs.map((fn) => (
              <label
                key={fn.key}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                  selectedKeys.includes(fn.key)
                    ? "border-[#1c9dde] bg-[#e9f4fb]"
                    : "border-[#e5e5e5] bg-white hover:border-[#1c9dde]/30"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedKeys.includes(fn.key)}
                  onChange={() => toggle(fn.key)}
                  className="mt-0.5 rounded border-gray-300"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#2b2b2b]">{fn.key}</p>
                  <p className="text-xs text-[#8a8a8a]">{fn.description}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                    selectedKeys.includes(fn.key)
                      ? "bg-[#1c9dde] text-white"
                      : "bg-[#f0f0f0] text-[#8a8a8a]"
                  }`}
                >
                  {fn.key}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {functions.length === 0 && (
        <p className="text-center text-sm text-[#8a8a8a]">No functions available</p>
      )}
    </div>
  );
};
