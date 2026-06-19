import { CampusView } from "@/components/common/CampusView";

export default function GeneralAdminPage() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">General Admin Page</h1>
      <p className="mb-4">
        This is a general page accessible to all admins, regardless of campus.
      </p>

      {/* Conditional UI for UC-Main Admins */}
      <CampusView allowedCampuses={["UC-Main"]} role="admin">
        <div className="relative rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
          <strong className="font-bold">UC-Main Specific Content:</strong>
          <span className="block sm:inline">
            {" "}
            Welcome, Main Campus Admin! Here are your exclusive controls.
          </span>
        </div>
      </CampusView>
    </div>
  );
}
