import React, { useState } from "react";
import { Calendar, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";
import { EventsTab } from "./EventsTab";
import { TemplatesTab } from "./TemplatesTab";
import { EventCertificateManagementView } from "./EventCertificateManagementView";

const tabs = [
  { key: "events", label: "Events", icon: Calendar },
  { key: "templates", label: "Templates", icon: LayoutTemplate },
] as const;

type TabKey = typeof tabs[number]["key"];

export const CertificateDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("events");
  const [managementEventId, setManagementEventId] = useState<string | null>(null);

  if (managementEventId) {
    return (
      <EventCertificateManagementView 
        eventId={managementEventId}
        onBack={() => setManagementEventId(null)}
      />
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap gap-8 border-b border-[#eeeeee]">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.key}
            className={cn(
              "relative flex cursor-pointer items-center gap-2 pb-3 text-sm text-[#858585]",
              activeTab === tab.key && "font-medium text-[#1c9dde]"
            )}
            onClick={() => setActiveTab(tab.key)}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-[#1c9dde]" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === "events" && <EventsTab onEventSelect={setManagementEventId} />}
        {activeTab === "templates" && <TemplatesTab />}
      </div>
    </div>
  );
};
