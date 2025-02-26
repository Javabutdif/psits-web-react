import React from "react";
import { Scanner } from "@yudiel/react-qr-scanner";

export const QRCodeScanner = () => {
  const handleScan = (detectedCodes) => {
    if (detectedCodes.length > 0) {
      const scannedURL = detectedCodes[0].rawValue;

      window.location.href = window.location.origin + scannedURL;
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-lg font-semibold">Scan Here</h2>

      <div className="w-full max-w-xs mt-4">
        <Scanner
          onScan={handleScan}
          onError={(error) => console.error("QR Scan Error:", error)}
          constraints={{ facingMode: "environment" }}
          allowMultiple={false}
          scanDelay={500}
        />
      </div>
    </div>
  );
};
