import { useState, useEffect } from "react";
import { getHealth } from "../api/devtools.api";
import { Activity, HardDrive, Database, Send, Users, ClipboardList, ShoppingBag, CalendarDays, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const SummaryCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string | number;
}) => (
  <div className="flex items-center gap-4 rounded-2xl border border-[#e5e5e5] bg-white px-5 py-4">
    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e9f4fb] text-[#1c9dde]">
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
      <p className="mt-1 text-xl font-semibold text-[#2b2b2b]">{value}</p>
    </div>
  </div>
);

export const HealthStatsPanel = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHealth()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[76px] rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SummaryCard icon={Activity} label="Uptime" value={stats?.uptime || "-"} />
        <SummaryCard
          icon={HardDrive}
          label="Memory"
          value={`${stats?.memory?.used ?? 0} MB / ${stats?.memory?.total ?? 0} MB`}
        />
        <SummaryCard
          icon={Database}
          label="MongoDB"
          value={stats?.mongoConnected ? "Connected" : "Disconnected"}
        />
        <SummaryCard
          icon={Send}
          label="Email API"
          value={stats?.emailConfigured ? "Configured" : "Not configured"}
        />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard icon={Users} label="Total Students" value={stats?.students ?? 0} />
        <SummaryCard icon={ClipboardList} label="Pending Orders" value={stats?.pendingOrders ?? 0} />
        <SummaryCard icon={ShoppingBag} label="Merch Items" value={stats?.merchItems ?? 0} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SummaryCard icon={CalendarDays} label="Active Events" value={stats?.activeEvents ?? 0} />
        <SummaryCard icon={Wallet} label="Memberships" value={stats?.memberships ?? 0} />
      </div>
    </div>
  );
};
