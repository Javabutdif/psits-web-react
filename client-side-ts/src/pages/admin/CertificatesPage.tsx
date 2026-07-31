import React from "react";
import { CertificateDashboard } from "../../features/admin/certificate-management";

const CertificatesPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="heading-2 mb-6">Certificate Management</h1>
      <CertificateDashboard />
    </div>
  );
};

export default CertificatesPage;
