import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Download, AlertCircle, Award, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth";
import { getStudentCertificateEvents, downloadStudentCertificate } from "../api/certificate.api";

interface MappedEvent {
  _id: string;
  eventId: string;
  eventName: string;
  eventTheme: string;
  location: string;
  eventDate: string;
  eventImage?: string[];
  isEligible: boolean;
  eventVenue?: string;
  eventVenueSpecific?: string;
}

export const StudentCertificateDashboard: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.idNumber;

  const [loading, setLoading] = useState(true);
  const [eligibleEvents, setEligibleEvents] = useState<MappedEvent[]>([]);
  const [otherEvents, setOtherEvents] = useState<MappedEvent[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await getStudentCertificateEvents();
      if (res && res.success) {
        setEligibleEvents(res.eligible || []);
        setOtherEvents(res.other || []);
      } else {
        toast.error("Failed to load certificates list.");
      }
    } catch (error) {
      console.error("Error fetching student certificates:", error);
      toast.error("An error occurred while loading certificates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchEvents();
    }
  }, [studentId]);

  const handleDownload = async (eventId: string, eventName: string) => {
    if (!studentId) {
      toast.error("Authenticated student ID not found.");
      return;
    }

    const lastDownloadKey = `cert-limit-${studentId}-${eventId}`;
    const lastDownloadTime = localStorage.getItem(lastDownloadKey);
    if (lastDownloadTime) {
      const elapsed = Date.now() - parseInt(lastDownloadTime, 10);
      const cooldownMs = 5 * 60 * 1000; // 5 minutes
      if (elapsed < cooldownMs) {
        const remainingMs = cooldownMs - elapsed;
        const minutes = Math.floor(remainingMs / 60000);
        const seconds = Math.ceil((remainingMs % 60000) / 1000);
        toast.error(`Please wait ${minutes}m ${seconds}s before downloading this certificate again.`);
        return;
      }
    }

    setDownloadingId(eventId);
    const toastId = toast.loading(`Generating certificate for ${eventName}...`);

    try {
      const blob = await downloadStudentCertificate(eventId, studentId);
      if (blob) {
        localStorage.setItem(lastDownloadKey, Date.now().toString());
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Certificate_${eventName.replace(/\s+/g, "_")}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success("Certificate downloaded successfully!", {
          id: toastId,
          style: {
            background: "#ecfdf5",
            color: "#047857",
            border: "1px solid #a7f3d0",
          },
        });
      } else {
        toast.error("Failed to download certificate.", { id: toastId });
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("An error occurred during download.", { id: toastId });
    } finally {
      setDownloadingId(null);
    }
  };

  const getEventImageSrc = (event: MappedEvent): string => {
    if (Array.isArray(event.eventImage) && event.eventImage.length > 0) {
      return event.eventImage[0];
    }
    return "/tech_seminar_banner.jpg"; // Default banner fallback
  };

  if (loading) {
    return (
      <div className="space-y-10">
        <div>
          <div className="mb-6 flex items-center gap-2 border-b border-gray-200 pb-3">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-6 w-48 rounded" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i} className="overflow-hidden border-gray-200">
                <Skeleton className="w-full aspect-video rounded-none" />
                <div className="p-5 space-y-4">
                  <Skeleton className="h-6 w-3/4 rounded" />
                  <Skeleton className="h-4 w-1/2 rounded" />
                  <div className="space-y-2 pt-2">
                    <Skeleton className="h-3 w-1/3 rounded" />
                    <Skeleton className="h-3 w-1/4 rounded" />
                  </div>
                  <Skeleton className="h-10 w-full rounded mt-4" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Eligible Events Section */}
      <div>
        <div className="mb-6 flex items-center gap-2 border-b border-gray-200 pb-3">
          <Award className="h-6 w-6 text-[#1c9dde]" />
          <h2 className="heading-3 font-semibold tracking-tight text-gray-900">
            Eligible Certificates
          </h2>
          <span className="ml-2 rounded-full bg-[#e8f5fc] px-2.5 py-0.5 text-xs font-semibold text-[#146f9e]">
            {eligibleEvents.length} Available
          </span>
        </div>

        {eligibleEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-gray-300 rounded-lg bg-gray-50/50">
            <Award className="h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-base font-semibold text-gray-700">No Certificates Ready</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-1">
              You haven&apos;t been marked as eligible for any certificate downloads yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
            {eligibleEvents.map((event) => (
              <Card
                key={event.eventId}
                className="group overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg border-gray-200 bg-white"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                  <img
                    src={getEventImageSrc(event)}
                    alt={event.eventName}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white shadow-sm">
                    Eligible
                  </div>
                </div>
                <CardHeader className="p-5 pb-2">
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-[#1c9dde] transition-colors leading-tight">
                    {event.eventName}
                  </CardTitle>
                  {event.eventTheme && (
                    <CardDescription className="text-sm font-medium text-gray-600 mt-1">
                      Theme: {event.eventTheme}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-4">
                  <div className="flex flex-col gap-2 text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>
                        {event.eventVenueSpecific
                          ? `${event.eventVenueSpecific} (${event.location})`
                          : event.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>
                        {event.eventDate
                          ? new Date(event.eventDate).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "TBA"}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleDownload(event.eventId, event.eventName)}
                    disabled={downloadingId !== null}
                    className="w-full bg-[#1c9dde] hover:bg-[#198fca] text-white transition-all duration-200 active:scale-[0.98] py-5 font-semibold text-sm rounded-md"
                  >
                    {downloadingId === event.eventId ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>Generating PDF...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Download className="h-4 w-4" />
                        <span>Download Certificate</span>
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Other Events Section */}
      <div>
        <div className="mb-6 flex items-center gap-2 border-b border-gray-200 pb-3">
          <AlertCircle className="h-6 w-6 text-gray-400" />
          <h2 className="heading-3 font-semibold tracking-tight text-gray-900">
            Other Events
          </h2>
          <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
            {otherEvents.length} Events
          </span>
        </div>

        <p className="text-sm text-gray-500 mb-6 max-w-2xl leading-relaxed">
          You are either not marked as eligible for these certificates or did not attend these events. Please contact the PSITS administrators if you believe this is an error.
        </p>

        {otherEvents.length === 0 ? (
          <div className="text-center p-8 text-sm text-gray-400 border border-dashed rounded-lg bg-gray-50/50">
            No other events.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 opacity-75">
            {otherEvents.map((event) => (
              <Card
                key={event.eventId}
                className="overflow-hidden border-dashed border-gray-300 bg-gray-50/50 cursor-not-allowed select-none"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-gray-100 grayscale-[40%]">
                  <img
                    src={getEventImageSrc(event)}
                    alt={event.eventName}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-3 right-3 rounded-full bg-gray-500 px-3 py-1 text-xs font-medium text-white shadow-sm">
                    Unavailable
                  </div>
                </div>
                <CardHeader className="p-5 pb-2">
                  <CardTitle className="text-xl font-bold text-gray-600 leading-tight">
                    {event.eventName}
                  </CardTitle>
                  {event.eventTheme && (
                    <CardDescription className="text-sm font-medium text-gray-500 mt-1">
                      Theme: {event.eventTheme}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <div className="flex flex-col gap-2 text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>
                        {event.eventVenueSpecific
                          ? `${event.eventVenueSpecific} (${event.location})`
                          : event.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>
                        {event.eventDate
                          ? new Date(event.eventDate).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "TBA"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
