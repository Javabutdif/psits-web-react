import { Info } from "lucide-react";

const columns = [
  "Admin",
  "Developer",
  "Head Finance",
  "Finance",
  "Executive",
  "Standard",
] as const;

type Column = (typeof columns)[number];

interface Capability {
  feature: string;
  grants: readonly Column[];
  notes?: string;
}

const capabilities: Capability[] = [
  {
    feature: "View Officers List",
    grants: ["Admin", "Developer", "Head Finance", "Finance", "Executive"],
    notes: "Read list filtered by own access.",
  },
  {
    feature: "Edit Officer Access",
    grants: ["Admin"],
    notes: "Blocked for self-downgrade.",
  },
  {
    feature: "Suspend/Restore Admin",
    grants: ["Admin"],
  },
  {
    feature: "Add / Approve / Decline Admin Accounts",
    grants: ["Admin"],
  },
  {
    feature: "Approve Member Requests",
    grants: ["Admin"],
  },
  {
    feature: "Change Membership Price",
    grants: ["Admin", "Finance"],
    notes: "HEAD_FINANCE currently shares finance-level write permission.",
  },
  {
    feature: "Reset Active Memberships",
    grants: ["Admin"],
    notes: "Settings panel locks save behind PSITS_ADMIN check.",
  },
  {
    feature: "Revoke Student Role",
    grants: ["Admin", "Executive"],
  },
  {
    feature: "View Dashboard / Students / Organization",
    grants: ["Admin", "Developer", "Head Finance", "Finance", "Executive"],
    notes: "Sidebar + router restrict non-UC_MAIN admins.",
  },
  {
    feature: "Event Raffle / Promo",
    grants: ["Admin", "Developer"],
    notes: "Router guard requires UC_MAIN campus.",
  },
  {
    feature: "Reports / Orders / Finances",
    grants: ["Admin", "Developer", "Head Finance", "Finance"],
    notes: "Router guard requires UC_MAIN campus.",
  },
  {
    feature: "Access DevTools",
    grants: ["Admin", "Developer"],
    notes:
      "Backend: requireAccessTokenWithDBCheck + role=admin + access in [ADMIN, DEVELOPER] + campus=MAIN.",
  },
  {
    feature: "Security Tab in DevTools",
    grants: ["Admin"],
    notes: "Frontend-only sub-tab visibility gate on top of backend guards.",
  },
];

export const PermissionMatrixPanel = () => {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <p>
            Backend middleware is authoritative. Matrix reflects current
            frontend router guards and service permissions at build time.
          </p>
        </div>
      </div>

      <div className="overflow-y-auto rounded-xl border border-[#e5e5e5]">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="bg-[#efefef] text-left text-sm text-[#2f2f2f]">
              <th className="min-w-[240px] px-4 py-2 font-medium">
                Capability
              </th>
              {columns.map((col) => (
                <th key={col} className="px-4 py-2 text-center font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {capabilities.map((cap, idx) => (
              <tr
                key={cap.feature}
                className={idx % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}
              >
                <td className="min-w-[240px] border-b border-[#ededed] px-4 py-2 font-medium">
                  {cap.feature}
                  {cap.notes && (
                    <p className="mt-1 text-xs font-normal text-gray-500">
                      {cap.notes}
                    </p>
                  )}
                </td>
                {columns.map((col) => (
                  <td
                    key={`${cap.feature}-${col}`}
                    className="border-b border-[#ededed] px-4 py-2 text-center"
                  >
                    {cap.grants.includes(col) ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 font-semibold text-green-700">
                        ✓
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
