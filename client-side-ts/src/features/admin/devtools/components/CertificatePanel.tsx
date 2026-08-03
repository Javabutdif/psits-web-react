import { useState, useEffect } from "react";
import { getCertificateTemplates } from "../api/devtools.api";
import type { CertificateTemplate } from "../types/devtools.types";
import { Skeleton } from "@/components/ui/skeleton";
import { BadgeCheck, XCircle, FileText } from "lucide-react";

export const CertificatePanel = () => {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCertificateTemplates()
      .then(setTemplates)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return <p className="py-16 text-center text-sm text-[#777]">No certificate templates found.</p>;
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="rounded-md bg-[#efefef] text-[#2f2f2f]">
              <th className="w-[25%] rounded-l-md px-3 py-2 text-left font-medium">Name</th>
              <th className="w-[40%] px-3 py-2 text-left font-medium">Description</th>
              <th className="w-[20%] px-3 py-2 text-left font-medium">Template Path</th>
              <th className="w-[15%] rounded-r-md px-3 py-2 text-center font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((template) => (
              <tr key={template._id} className="border-b border-[#ededed] text-[#303030] hover:bg-[#fafafa]">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#858585]" />
                    <span className="font-medium">{template.name}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-[#777]">{template.description || "-"}</td>
                <td className="px-3 py-3 font-mono text-xs">{template.ejsRelativePath}</td>
                <td className="px-3 py-3 text-center">
                  {template.isActive ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
                      <BadgeCheck className="h-3 w-3" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-600">
                      <XCircle className="h-3 w-3" />
                      Inactive
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};