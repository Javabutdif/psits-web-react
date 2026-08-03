import { useState, useEffect } from "react";
import { getSystemSettings } from "../api/devtools.api";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings as SettingsIcon, DollarSign } from "lucide-react";

export const SettingsPanel = () => {
  const [settings, setSettings] = useState<{ membership_price: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSystemSettings()
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!settings) {
    return <p className="py-16 text-center text-sm text-[#777]">No settings found.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
        <div className="flex items-start gap-2">
          <SettingsIcon className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <p>View current system settings. These are read-only in DevTools.</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#e9f4fb] text-[#1c9dde]">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-[#858585] uppercase tracking-wide">Membership Price</p>
                <p className="text-lg font-semibold text-[#2b2b2b]">
                  {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(settings.membership_price)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};