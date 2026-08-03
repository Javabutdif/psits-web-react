import { useState } from "react";
import { exportCollection } from "../api/devtools.api";
import { Button } from "@/components/ui/button";
import { showToast } from "@/utils/alertHelper";
import { Download, Database } from "lucide-react";

const COLLECTIONS = [
  "Admin",
  "Student",
  "Orders",
  "EmailQueue",
  "Merch",
  "Event",
  "MembershipHistory",
  "CertificateTemplate",
  "Log",
  "Settings",
];

const COLLECTION_FIELDS: Record<string, string[]> = {
  Admin: ["name", "id_number", "campus", "position", "access", "status"],
  Student: ["first_name", "last_name", "id_number", "course", "year", "campus", "status"],
  Orders: ["reference_code", "student_name", "id_number", "order_status", "total", "order_date"],
  EmailQueue: ["email", "type", "subtype", "status", "referenceCode"],
  Merch: ["name", "price", "stock", "is_active"],
  Event: ["name", "description", "date_start", "date_end", "location"],
  MembershipHistory: ["name", "reference_code", "course", "year", "total", "date"],
  CertificateTemplate: ["name", "description", "ejsRelativePath", "isActive"],
  Log: ["admin", "action", "target", "timestamp"],
  Settings: ["membership_price"],
};

export const DataExportPanel = () => {
  const [selectedCollection, setSelectedCollection] = useState("Admin");
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportCollection({ collection: selectedCollection });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedCollection.toLowerCase()}-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      showToast("success", `Exported ${selectedCollection} data`);
    } catch {
      showToast("error", "Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
        <div className="flex items-start gap-2">
          <Database className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <p>Export any collection to CSV. Useful for offline analysis and reporting.</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#2b2b2b]">
            Select Collection
          </label>
          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            className="h-10 w-full rounded-lg border-[#ececec] bg-white px-3 text-sm"
          >
            {COLLECTIONS.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#2b2b2b]">
            Fields to Export (comma-separated, leave empty for all)
          </label>
          <input
            type="text"
            placeholder="name, id_number, email..."
            defaultValue={COLLECTION_FIELDS[selectedCollection]?.join(", ")}
            className="h-10 w-full rounded-lg border-[#ececec] bg-white px-3 text-sm"
          />
        </div>

        <Button
          type="button"
          className="h-10 w-full rounded-full bg-[#1c9dde] hover:bg-[#168bc7]"
          onClick={handleExport}
          disabled={exporting}
        >
          <Download className="mr-2 h-4 w-4" />
          {exporting ? "Exporting..." : `Export ${selectedCollection} to CSV`}
        </Button>
      </div>
    </div>
  );
};