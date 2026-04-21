import React, { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { Scanner } from "@yudiel/react-qr-scanner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { QRCodePayloadV2 } from "@/features/events/types/event.types";

interface ScanQRModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanSuccess: (payload: QRCodePayloadV2) => Promise<boolean>;
}

function parseQRPayload(raw: string): QRCodePayloadV2 | null {
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      parsed.v === 2 &&
      typeof parsed.eventId === "string" &&
      typeof parsed.studentId === "string" &&
      typeof parsed.name === "string" &&
      typeof parsed.campus === "string"
    ) {
      return parsed as QRCodePayloadV2;
    }
    return null;
  } catch {
    return null;
  }
}

export const ScanQRModal: React.FC<ScanQRModalProps> = ({
  open,
  onOpenChange,
  onScanSuccess,
}) => {
  const [error, setError] = useState("");
  const [isProcessingScan, setIsProcessingScan] = useState(false);

  const handleClose = () => {
    if (isProcessingScan) return;
    setError("");
    onOpenChange(false);
  };

  const handleScan = async (detectedCodes: Array<{ rawValue: string }>) => {
    if (detectedCodes.length === 0 || isProcessingScan) return;

    const scannedValue = detectedCodes[0].rawValue;
    const payload = parseQRPayload(scannedValue);

    if (payload) {
      setError("");
      setIsProcessingScan(true);

      try {
        const isSuccess = await onScanSuccess(payload);

        if (isSuccess) {
          handleClose();
          return;
        }

        setError("Unable to mark attendance. Please scan the QR code again.");
      } catch {
        setError("Failed to process the scan. Please try again.");
      } finally {
        setIsProcessingScan(false);
      }
    } else {
      setError("Invalid QR Code. Please scan a valid attendance QR code.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleClose();
        }
      }}
    >
      <DialogContent
        className="w-full max-w-lg gap-0 rounded-lg p-0 sm:max-w-xs sm:rounded-xl"
        showCloseButton={false}
      >
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl leading-6 font-semibold">
              Scan QR Code
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleClose}
              disabled={isProcessingScan}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-6 py-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* QR Scanner */}
          <div className="bg-muted relative aspect-square overflow-hidden rounded-lg">
            {open && !isProcessingScan && (
              <Scanner
                onScan={handleScan}
                onError={(err) => {
                  console.error("QR Scan Error:", err);
                  setError(
                    "Unable to access camera. Please check your permissions."
                  );
                }}
                constraints={{ facingMode: "environment" }}
                allowMultiple={false}
                scanDelay={500}
              />
            )}

            {isProcessingScan && (
              <div className="absolute inset-0 z-10 space-y-4 p-4">
                <Skeleton className="mx-auto h-5 w-40" />
                <Skeleton className="h-44 w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            )}

            {/* Scanning Overlay */}
            {!isProcessingScan && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative h-64 w-64">
                  <div className="absolute top-0 left-0 h-16 w-16 rounded-tl-lg border-t-4 border-l-4 border-[#1C9DDE]" />
                  <div className="absolute top-0 right-0 h-16 w-16 rounded-tr-lg border-t-4 border-r-4 border-[#1C9DDE]" />
                  <div className="absolute bottom-0 left-0 h-16 w-16 rounded-bl-lg border-b-4 border-l-4 border-[#1C9DDE]" />
                  <div className="absolute right-0 bottom-0 h-16 w-16 rounded-br-lg border-r-4 border-b-4 border-[#1C9DDE]" />
                </div>
              </div>
            )}

            {/* Instructions */}
            {!error && !isProcessingScan && (
              <div className="pointer-events-none absolute right-0 bottom-4 left-0 text-center">
                <p className="inline-block rounded-full bg-black/50 px-4 py-2 text-sm font-medium text-white">
                  Position QR code within the frame
                </p>
              </div>
            )}

            {isProcessingScan && (
              <div className="absolute right-0 bottom-4 left-0 text-center">
                <p className="inline-block rounded-full bg-black/50 px-4 py-2 text-sm font-medium text-white">
                  Processing scan...
                </p>
              </div>
            )}
          </div>

          {/* Cancel Button */}
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessingScan}
            className="w-full cursor-pointer"
          >
            {isProcessingScan ? "Processing..." : "Cancel"}
          </Button>

          <p className="text-muted-foreground text-center text-xs">
            Make sure the QR code is clear and well-lit for best results
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
