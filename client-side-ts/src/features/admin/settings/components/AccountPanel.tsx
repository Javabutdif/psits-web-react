import { useAuth } from "@/features/auth";

interface AccountPanelProps {
  isAdminAccess: boolean;
}

export const AccountPanel = ({ isAdminAccess }: AccountPanelProps) => {
  const { user } = useAuth();

  if (!user) return null;

  const displayName = user.name || "Unknown Admin";
  const displayId = user.idNumber || "-";
  const displayEmail = user.email || "-";
  const displayCampus = user.campus || "-";
  const displayRole = user.access || "-";

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[#e5e5e5] bg-white p-5">
        <h3 className="mb-4 text-base font-medium">My Profile</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs text-[#8a8a8a]">Name</label>
            <p className="mt-1 text-sm font-medium">{displayName}</p>
          </div>
          <div>
            <label className="text-xs text-[#8a8a8a]">Student ID</label>
            <p className="mt-1 text-sm font-medium">{displayId}</p>
          </div>
          <div>
            <label className="text-xs text-[#8a8a8a]">Email</label>
            <p className="mt-1 text-sm font-medium">{displayEmail}</p>
          </div>
          <div>
            <label className="text-xs text-[#8a8a8a]">Campus</label>
            <p className="mt-1 text-sm font-medium">{displayCampus}</p>
          </div>
          <div>
            <label className="text-xs text-[#8a8a8a]">Access Level</label>
            <p className="mt-1 text-sm font-medium capitalize">{displayRole.replace("PSITS_", "")}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[#e5e5e5] bg-white p-5">
        <h3 className="mb-4 text-base font-medium">Account Actions</h3>
        <p className="mb-4 text-sm text-[#8a8a8a]">
          Contact UC_MAIN admin to modify your account details or password.
        </p>
        {!isAdminAccess && (
          <p className="text-xs text-orange-600">Standard access users cannot modify their own account settings.</p>
        )}
      </section>
    </div>
  );
};
