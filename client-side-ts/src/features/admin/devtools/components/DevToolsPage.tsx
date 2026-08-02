import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Code, Mail, Activity, Users, Zap, Clock, Shield, Database, KeyRound, Inbox, FileCheck } from "lucide-react";
import { EmailQueuePanel } from "../components/EmailQueuePanel";
import { HealthStatsPanel } from "../components/HealthStatsPanel";
import { SessionManagerPanel } from "../components/SessionManagerPanel";
import { QuickActionsPanel } from "../components/QuickActionsPanel";
import { ApiTesterPanel } from "../components/ApiTesterPanel";
import { CronMonitorPanel } from "../components/CronMonitorPanel";
import { EnvInspectorPanel } from "../components/EnvInspectorPanel";
import { RateLimitPanel } from "../components/RateLimitPanel";
import { DbPerformancePanel } from "../components/DbPerformancePanel";
import { OfficerAccessPanel } from "../components/OfficerAccessPanel";
import { SuspendedOfficersPanel } from "../components/SuspendedOfficersPanel";
import { PendingRequestsPanel } from "../components/PendingRequestsPanel";
import { PermissionMatrixPanel } from "../components/PermissionMatrixPanel";

const sections = [
  { key: "diagnostics", label: "Diagnostics" },
  { key: "operations", label: "Operations" },
  { key: "security", label: "Security" },
];

const sectionPanels: Record<string, PanelTab[]> = {
  diagnostics: [
    { key: "email", label: "Email Queue", icon: Mail },
    { key: "health", label: "Health", icon: Activity },
    { key: "cron", label: "Cron Monitor", icon: Clock },
    { key: "env", label: "Env Inspector", icon: Shield },
    { key: "ratelimit", label: "Rate Limiter", icon: Shield },
    { key: "dbperf", label: "DB Performance", icon: Database },
  ],
  operations: [
    { key: "sessions", label: "Sessions", icon: Users },
    { key: "actions", label: "Quick Actions", icon: Zap },
    { key: "tester", label: "API Tester", icon: Code },
  ],
  security: [
    { key: "officers", label: "Officer Access", icon: KeyRound },
    { key: "suspended", label: "Suspended Officers", icon: Shield },
    { key: "pending", label: "Pending Requests", icon: Inbox },
    { key: "matrix", label: "Permission Matrix", icon: FileCheck },
  ],
};

const getPanels = (section: string): PanelTab[] => sectionPanels[section] || sectionPanels.diagnostics;

export const DevToolsPage = () => {
  const [activeSection, setActiveSection] = useState("diagnostics");
  const [activeTab, setActiveTab] = useState("email");
  const currentPanels = getPanels(activeSection);
const displayActiveTab = currentPanels.some((p) => p.key === activeTab) ? activeTab : currentPanels[0]?.key ?? "email";

  return (
    <div className="bg-background flex min-h-full flex-1 flex-col text-[#333] [&_button:disabled]:cursor-not-allowed [&_button:not(:disabled)]:cursor-pointer">
      <header className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Developer Tools</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Server diagnostics, operational utilities, and admin security controls
        </p>
      </header>

      <div className="px-4 pb-8 sm:px-6 lg:px-8">
        <Tabs value={activeSection} onValueChange={setActiveSection}>
          <div className="mb-5 flex w-full gap-6 border-b border-[#eeeeee] sm:w-auto sm:gap-8 overflow-x-auto">
            {sections.map((section) => (
              <button
                key={section.key}
                type="button"
                onClick={() => setActiveSection(section.key)}
                className={`relative shrink-0 cursor-pointer pb-3 text-sm ${
                  activeSection === section.key
                    ? "font-medium text-[#1c9dde]"
                    : "text-[#858585]"
                }`}
              >
                {section.label}
                {activeSection === section.key && (
                  <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-[#1c9dde]" />
                )}
              </button>
            ))}
          </div>

          <TabsContent value="diagnostics" className="mt-0 space-y-5">
            <SectionHeader title="Diagnostics" subtitle="Server health, environment, database, and background jobs." />
            <TabBar
              tabs={currentPanels}
              activeTab={displayActiveTab}
              onChange={(tab) => {
                setActiveTab(tab);
                setActiveSection("diagnostics");
              }}
            />
            <PanelRenderer activeTab={displayActiveTab} />
          </TabsContent>

          <TabsContent value="operations" className="mt-0 space-y-5">
            <SectionHeader title="Operations" subtitle="Queues, sessions, scheduled tasks, and diagnostic probes." />
            <TabBar
              tabs={currentPanels}
              activeTab={displayActiveTab}
              onChange={(tab) => {
                setActiveTab(tab);
                setActiveSection("operations");
              }}
            />
            <PanelRenderer activeTab={displayActiveTab} />
          </TabsContent>

          <TabsContent value="security" className="mt-0 space-y-5">
            <SectionHeader title="Security" subtitle="Role management, session invalidation, access reviews, and pending grants." />
            <TabBar
              tabs={currentPanels}
              activeTab={displayActiveTab}
              onChange={(tab) => {
                setActiveTab(tab);
                setActiveSection("security");
              }}
            />
            <PanelRenderer activeTab={displayActiveTab} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface PanelTab {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SectionHeaderProps {
  title: string;
  subtitle: string;
}

const SectionHeader = ({ title, subtitle }: SectionHeaderProps) => (
  <div className="space-y-1">
    <h2 className="text-lg font-semibold text-[#1c9dde]">{title}</h2>
    <p className="text-sm text-[#777]">{subtitle}</p>
  </div>
);

interface TabBarProps {
  tabs: PanelTab[];
  activeTab: string;
  onChange: (key: string) => void;
}

const TabBar = ({ tabs, activeTab, onChange }: TabBarProps) => (
  <div className="flex w-full flex-wrap gap-2 overflow-x-auto sm:w-auto">
    {tabs.map((tab) => (
      <button
        key={tab.key}
        type="button"
        onClick={() => onChange(tab.key)}
        className={`flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm ${
          activeTab === tab.key
            ? "border-[#1c9dde] bg-blue-50 text-[#1c9dde]"
            : "border-[#e5e5e5] bg-white text-gray-500"
        }`}
      >
        <tab.icon className="h-4 w-4 shrink-0" />
        {tab.label}
      </button>
    ))}
  </div>
);

interface PanelRendererProps {
  activeTab: string;
}

const PanelRenderer = ({ activeTab }: PanelRendererProps) => {
  switch (activeTab) {
    case "email":
      return <EmailQueuePanel />;
    case "health":
      return <HealthStatsPanel />;
    case "cron":
      return <CronMonitorPanel />;
    case "env":
      return <EnvInspectorPanel />;
    case "ratelimit":
      return <RateLimitPanel />;
    case "dbperf":
      return <DbPerformancePanel />;
    case "sessions":
      return <SessionManagerPanel />;
    case "actions":
      return <QuickActionsPanel />;
    case "tester":
      return <ApiTesterPanel />;
    case "officers":
      return <OfficerAccessPanel />;
    case "suspended":
      return <SuspendedOfficersPanel />;
    case "pending":
      return <PendingRequestsPanel />;
    case "matrix":
      return <PermissionMatrixPanel />;
    default:
      return null;
  }
};
