import { useState } from "react";
import { Code, HandHeart, Images, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContributionDashboard } from "./ContributionDashboard";
import { DeveloperContributions } from "./DeveloperContributions";
import { MediaContributions } from "./MediaContributions";
import { VolunteerContributions } from "./VolunteerContributions";
import { PSITS_ROLES } from "@/features/admin/constants/adminAccess";
import { useAuth } from "@/features/auth";

type Tab = "dashboard" | "developer" | "media" | "volunteer";

const tabs: Array<{ key: Tab; label: string; icon: React.ElementType }> = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "developer", label: "Developer", icon: Code },
  { key: "media", label: "Media", icon: Images },
  { key: "volunteer", label: "Volunteer", icon: HandHeart },
];

export const ContributionsView = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const hasDevAccess =
    user?.access === PSITS_ROLES.DEVELOPER ||
    user?.access === PSITS_ROLES.ADMIN;

  return (
    <div className="flex min-h-full flex-1 flex-col text-[#333]">
      <header className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Contributions</h1>
        <p className="mt-1 text-sm text-[#858585] sm:text-base">
          Track developer, media, and volunteer contributions
        </p>
      </header>

      <div className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap gap-8 border-b border-[#eeeeee]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                type="button"
                key={tab.key}
                className={cn(
                  "relative flex cursor-pointer items-center gap-2 pb-3 text-sm text-[#858585]",
                  activeTab === tab.key && "font-medium text-[#1c9dde]"
                )}
                onClick={() => setActiveTab(tab.key)}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {activeTab === tab.key && (
                  <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-[#1c9dde]" />
                )}
              </button>
            );
          })}
        </div>

        {activeTab === "dashboard" && <ContributionDashboard />}
        {activeTab === "developer" && (
          <DeveloperContributions hasDevAccess={hasDevAccess} />
        )}
        {activeTab === "media" && <MediaContributions />}
        {activeTab === "volunteer" && <VolunteerContributions />}
      </div>
    </div>
  );
};