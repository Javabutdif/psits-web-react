import { CampusView } from "@/components/common/CampusView";

export default function GeneralStudentPage() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">General Student Page</h1>
      <p className="mb-4">
        This is a general page accessible to all students, regardless of campus.
      </p>

      {/* Conditional UI for UC-Main Students */}
      <CampusView allowedCampuses={["UC-MAIN"]} role="student">
        <div className="relative rounded border border-blue-400 bg-blue-100 px-4 py-3 text-blue-700">
          <strong className="font-bold">UC-Main Specific Content:</strong>
          <span className="block sm:inline">
            {" "}
            Welcome, Main Campus Student! Here are your exclusive updates.
          </span>
        </div>
      </CampusView>
    </div>
  );
}
