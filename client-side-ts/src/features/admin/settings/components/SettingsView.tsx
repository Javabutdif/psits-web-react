import { Wallet, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettingsData } from "../hooks/useSettingsData";
import { MembershipPanel } from "./MembershipPanel";
import { AccountPanel } from "./AccountPanel";

const tabConfig = [
  { key: "membership" as const, label: "Membership", icon: Wallet },
  { key: "account" as const, label: "Account", icon: User },
];

export const SettingsView = () => {
  const {
    activeTab,
    setActiveTab,
    membershipPrice,
    priceDraft,
    setPriceDraft,
    priceEditMode,
    setPriceEditMode,
    confirmPrice,
    setConfirmPrice,
    confirmRevoke,
    setConfirmRevoke,
     isPriceAdminAccess, // for membership price edits
     isAdminAccess, // for account panel and other admin checks
     handleSavePrice,
    handleRevoke,
  } = useSettingsData();

  return (
    <div className="bg-background flex min-h-full flex-1 flex-col text-[#333] [&_button:disabled]:cursor-not-allowed [&_button:not(:disabled)]:cursor-pointer">
      <header className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Manage membership settings and your admin profile
        </p>
      </header>

      <div className="px-4 pb-8 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-5 flex w-full border-b border-[#eeeeee] sm:w-auto sm:gap-8">
          {tabConfig.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={cn(
                "relative flex flex-1 cursor-pointer items-center justify-center gap-2 pb-3 text-sm text-[#858585]",
                "sm:flex-initial sm:justify-start",
                activeTab === tab.key && "font-medium text-[#1c9dde]"
              )}
              onClick={() => setActiveTab(tab.key)}
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
          {activeTab === "membership" && (
            <MembershipPanel
              membershipPrice={membershipPrice}
              priceDraft={priceDraft}
              setPriceDraft={setPriceDraft}
              priceEditMode={priceEditMode}
              setPriceEditMode={setPriceEditMode}
              confirmPrice={confirmPrice}
              setConfirmPrice={setConfirmPrice}
              confirmRevoke={confirmRevoke}
              setConfirmRevoke={setConfirmRevoke}
              isPriceAdminAccess={isPriceAdminAccess}
              onSavePrice={handleSavePrice}
              onRevoke={handleRevoke}
            />
          )}

          {activeTab === "account" && (
            <AccountPanel isAdminAccess={isAdminAccess} />
          )}
        </section>
      </div>
    </div>
  );
};
