import React from "react";
import { StudentCertificateDashboard } from "@/features/certificate";

export const StudentCertificatesPage: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="heading-2 font-bold tracking-tight text-gray-900 mb-2">My Certificates</h1>
        <p className="text-sm text-gray-500 font-medium leading-relaxed">
          View and download certificates of attendance for events you have participated in.
        </p>
      </div>

      <StudentCertificateDashboard />
    </div>
  );
};

export default StudentCertificatesPage;
