import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Code, Mail, Activity, Users, Zap, Clock, Shield, Database } from "lucide-react";
import { EmailQueuePanel } from "../components/EmailQueuePanel";
import { HealthStatsPanel } from "../components/HealthStatsPanel";
import { SessionManagerPanel } from "../components/SessionManagerPanel";
import { QuickActionsPanel } from "../components/QuickActionsPanel";
import { ApiTesterPanel } from "../components/ApiTesterPanel";
import { CronMonitorPanel } from "../components/CronMonitorPanel";
import { EnvInspectorPanel } from "../components/EnvInspectorPanel";
import { RateLimitPanel } from "../components/RateLimitPanel";
import { DbPerformancePanel } from "../components/DbPerformancePanel";

const tabs = [
  { key: "email", label: "Email Queue", icon: Mail },
  { key: "health", label: "Health", icon: Activity },
  { key: "sessions", label: "Sessions", icon: Users },
  { key: "actions", label: "Quick Actions", icon: Zap },
  { key: "tester", label: "API Tester", icon: Code },
  { key: "cron", label: "Cron Monitor", icon: Clock },
  { key: "env", label: "Env Inspector", icon: Shield },
  { key: "ratelimit", label: "Rate Limiter", icon: Shield },
  { key: "dbperf", label: "DB Performance", icon: Database },
];

export const DevToolsPage = () => {
  const [activeTab, setActiveTab] = useState("email");

  return (
    <div className="bg-background flex min-h-full flex-1 flex-col text-[#333] [&_button:disabled]:cursor-not-allowed [&_button:not(:disabled)]:cursor-pointer">
      <header className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Developer Tools</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Server diagnostics, email queue, and utilities
        </p>
      </header>

      <div className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex w-full border-b border-[#eeeeee] sm:w-auto sm:gap-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex shrink-0 cursor-pointer items-center justify-center gap-2 pb-3 text-sm ${
                activeTab === tab.key
                  ? "font-medium text-[#1c9dde]"
                  : "text-[#858585]"
              }`}
            >
              <tab.icon className="h-4 w-4 shrink-0" />
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-[#1c9dde]" />
              )}
            </button>
          ))}
        </div>

        <section className="rounded-[22px] border border-[#e5e5e5] bg-white px-4 py-5 sm:px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="email" className="mt-0">
              <EmailQueuePanel />
            </TabsContent>
            <TabsContent value="health" className="mt-0">
              <HealthStatsPanel />
            </TabsContent>
            <TabsContent value="sessions" className="mt-0">
              <SessionManagerPanel />
            </TabsContent>
            <TabsContent value="actions" className="mt-0">
              <QuickActionsPanel />
            </TabsContent>
            <TabsContent value="tester" className="mt-0">
              <ApiTesterPanel />
            </TabsContent>
            <TabsContent value="cron" className="mt-0">
              <CronMonitorPanel />
            </TabsContent>
            <TabsContent value="env" className="mt-0">
              <EnvInspectorPanel />
            </TabsContent>
            <TabsContent value="ratelimit" className="mt-0">
              <RateLimitPanel />
            </TabsContent>
            <TabsContent value="dbperf" className="mt-0">
              <DbPerformancePanel />
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
};
