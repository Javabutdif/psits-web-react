import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AttendeesTable } from "@/features/admin/event-management";
import {
  AttendeeSettingsModal,
  EditEventModal,
} from "@/features/admin/event-management/components/modals";
import { getEventById } from "@/features/events/api/eventService";
import type {
  Event as ApiEvent,
  EventMerchMeta,
} from "@/features/events/types/event.types";
import { useAuth } from "@/features/auth";
import type { Campus } from "@/features/auth/types/auth.types";
import { showToast } from "@/utils/alertHelper";

interface EventDetails {
  id: string;
  title: string;
  status: "ongoing" | "ended" | "upcoming";
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  locationAddress: string;
  description: string;
  image: string;
  campusCodes: Campus[];
  venues: string[];
  merch: EventMerchMeta | null;
  attendanceType: "open" | "ticketed";
}

const CAMPUS_CODE_TO_NAME: Record<Campus, string> = {
  "UC-MAIN": "University of Cebu Main Campus",
  "UC-BANILAD": "University of Cebu Banilad Campus",
  "UC-LM": "University of Cebu Lapu-Lapu & Mandaue",
  "UC-PT": "University of Cebu Pardo & Talisay",
  "UC-CS": "University of Cebu Main Campus",
};

const DEFAULT_CAMPUSES: Campus[] = ["UC-MAIN", "UC-BANILAD", "UC-LM", "UC-PT"];

const normalizeCampusForFilter = (campus: Campus): Campus =>
  campus === "UC-CS" ? "UC-MAIN" : campus;

const UNDER_CONSTRUCTION_MESSAGE =
  "This is under construction, visit legacy website to access this functionality.";

interface SessionConfigType {
  enabled?: boolean;
  timeRange?: string;
}

interface EventSessionConfig {
  morning?: SessionConfigType;
  afternoon?: SessionConfigType;
  evening?: SessionConfigType;
}

type EventStatus = EventDetails["status"];

const formatEventDateLabel = (value: unknown): string => {
  if (!value) return "TBA";

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

const normalizeStatus = (value: unknown): EventStatus => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  if (normalized === "ongoing") return "ongoing";
  if (normalized === "upcoming") return "upcoming";
  return "ended";
};

const getSessionBounds = (
  sessionConfig: EventSessionConfig | undefined
): { startTime: string; endTime: string } => {
  const order: Array<keyof EventSessionConfig> = [
    "morning",
    "afternoon",
    "evening",
  ];

  const enabledRanges = order
    .map((key) => sessionConfig?.[key])
    .filter((session): session is SessionConfigType =>
      Boolean(session?.enabled && session?.timeRange)
    )
    .map((session) => String(session.timeRange));

  if (enabledRanges.length === 0) {
    return { startTime: "TBA", endTime: "TBA" };
  }

  const [firstStart = "TBA"] = enabledRanges[0].split(" - ");
  const lastRange = enabledRanges[enabledRanges.length - 1];
  const [, lastEnd = "TBA"] = lastRange.split(" - ");

  return { startTime: firstStart, endTime: lastEnd };
};

const normalizeMerchMeta = (value: unknown): EventMerchMeta | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as {
    category?: unknown;
    type?: unknown;
    selectedSizes?: unknown;
    selectedVariations?: unknown;
  };

  const selectedSizesSource =
    raw.selectedSizes && typeof raw.selectedSizes === "object"
      ? raw.selectedSizes
      : {};

  const selectedSizes = Object.entries(selectedSizesSource).reduce<
    EventMerchMeta["selectedSizes"]
  >((acc, [size, option]) => {
    if (!option || typeof option !== "object") {
      return acc;
    }

    const parsed = option as { custom?: unknown; price?: unknown };
    acc[size] = {
      custom: Boolean(parsed.custom),
      price: String(parsed.price ?? "0"),
    };
    return acc;
  }, {});

  return {
    category: typeof raw.category === "string" ? raw.category : null,
    type: typeof raw.type === "string" ? raw.type : null,
    selectedSizes,
    selectedVariations: Array.isArray(raw.selectedVariations)
      ? raw.selectedVariations.map((item) => String(item))
      : [],
  };
};

const mapApiEventToEventDetails = (
  routeEventId: string,
  event: ApiEvent
): EventDetails => {
  const sessionConfig = event.sessionConfig as EventSessionConfig | undefined;
  const { startTime, endTime } = getSessionBounds(sessionConfig);
  const mappedCampusCodes = Array.isArray(event.limit)
    ? event.limit
        .map((item) => {
          const campusCode =
            item && typeof item === "object" && "campus" in item
              ? String((item as { campus?: unknown }).campus ?? "")
              : "";
          if (campusCode in CAMPUS_CODE_TO_NAME) {
            return normalizeCampusForFilter(campusCode as Campus);
          }
          return null;
        })
        .filter((campus): campus is Campus => Boolean(campus))
    : [];

  const image =
    Array.isArray(event.eventImage) && event.eventImage.length > 0
      ? String(event.eventImage[0])
      : "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=600&fit=crop";

  const normalizedCampusCodes = Array.from(
    new Set<Campus>([
      "UC-MAIN",
      ...(mappedCampusCodes.length > 0 ? mappedCampusCodes : DEFAULT_CAMPUSES),
    ])
  );

  return {
    id: String(event.eventId ?? routeEventId),
    title: String(event.eventName ?? "Untitled Event"),
    status: normalizeStatus(event.status),
    startDate: formatEventDateLabel(event.eventDate),
    startTime,
    endDate: formatEventDateLabel(event.eventDate),
    endTime,
    location:
      (typeof event.location === "string" && event.location) ||
      "Location not specified",
    locationAddress:
      (typeof event.locationAddress === "string" && event.locationAddress) ||
      "Address not specified",
    description:
      (typeof event.eventDescription === "string" && event.eventDescription) ||
      "No description available.",
    image,
    campusCodes: normalizedCampusCodes,
    venues: normalizedCampusCodes.map((code) => CAMPUS_CODE_TO_NAME[code]),
    merch: normalizeMerchMeta(event.merch),
    attendanceType:
      event.attendanceType === "open" || event.attendanceType === "ticketed"
        ? event.attendanceType
        : "ticketed",
  };
};

const EventManagement: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const normalizedRouteEventId = eventId?.trim() ?? "";
  const hasValidRouteEventId = normalizedRouteEventId.length > 0;
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [isLoadingEvent, setIsLoadingEvent] =
    useState<boolean>(hasValidRouteEventId);
  const [loadError, setLoadError] = useState<string | null>(
    hasValidRouteEventId ? null : "Missing event ID from route."
  );
  const [activeCampus, setActiveCampus] = useState<Campus | "all">("all");
  const [isAttendeeSettingsOpen, setIsAttendeeSettingsOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);

  // Tab scroll state
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const isAdmin = user?.role === "admin";
  const isUcMainAdmin = isAdmin && user?.campus === "UC-MAIN";

  const availableCampusCodes = useMemo(() => {
    const eventCampusCodes = eventDetails?.campusCodes ?? DEFAULT_CAMPUSES;

    if (!isAdmin || isUcMainAdmin) {
      return eventCampusCodes;
    }

    const userCampus = user?.campus;
    if (!userCampus) {
      return [eventCampusCodes[0]];
    }

    const normalizedUserCampus = normalizeCampusForFilter(userCampus);
    if (eventCampusCodes.includes(normalizedUserCampus)) {
      return [normalizedUserCampus];
    }

    return [normalizedUserCampus];
  }, [eventDetails?.campusCodes, isAdmin, isUcMainAdmin, user?.campus]);

  const activeCampusValue =
    isUcMainAdmin && activeCampus === "all"
      ? "all"
      : activeCampus !== "all" && availableCampusCodes.includes(activeCampus)
        ? activeCampus
        : availableCampusCodes[0];

  const handleCampusChange = (campusCode: string) => {
    if (campusCode === "all" && isUcMainAdmin) {
      setActiveCampus("all");
    } else if (campusCode in CAMPUS_CODE_TO_NAME) {
      setActiveCampus(normalizeCampusForFilter(campusCode as Campus));
    }
  };

  // Check if scroll arrows should be visible
  const updateScrollArrows = useCallback(() => {
    const container = tabsScrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 1);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  // Scroll the tabs container
  const scrollTabs = useCallback(
    (direction: "left" | "right") => {
      const container = tabsScrollRef.current;
      if (!container) return;

      const scrollAmount = 250;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });

      // Update arrows after scroll animation
      setTimeout(updateScrollArrows, 350);
    },
    [updateScrollArrows]
  );

  // Observe container resize and update arrows
  useEffect(() => {
    const container = tabsScrollRef.current;
    if (!container) return;

    updateScrollArrows();

    container.addEventListener("scroll", updateScrollArrows, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      updateScrollArrows();
    });
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", updateScrollArrows);
      resizeObserver.disconnect();
    };
  }, [updateScrollArrows, availableCampusCodes]);

  useEffect(() => {
    if (!hasValidRouteEventId) {
      return;
    }

    let isMounted = true;

    const fetchEvent = async () => {
      setIsLoadingEvent(true);
      setLoadError(null);

      const result = await getEventById(normalizedRouteEventId);

      if (!isMounted) return;

      if (!result) {
        setEventDetails(null);
        setLoadError("Unable to load event details.");
        setIsLoadingEvent(false);
        return;
      }

      setEventDetails(
        mapApiEventToEventDetails(normalizedRouteEventId, result)
      );
      setIsLoadingEvent(false);
    };

    fetchEvent();

    return () => {
      isMounted = false;
    };
  }, [hasValidRouteEventId, normalizedRouteEventId]);

  const handleBack = () => {
    navigate("/admin/events");
  };

  const handleEditEvent = () => {
    if (!eventDetails || !isUcMainAdmin) return;
    showToast("error", UNDER_CONSTRUCTION_MESSAGE);
  };

  const handleAttendeeSettings = () => {
    if (!isUcMainAdmin) return;
    showToast("error", UNDER_CONSTRUCTION_MESSAGE);
  };

  const handleSaveAttendeeLimits = (limits: Record<string, number>) => {
    console.warn("Save attendee limits:", limits);
  };

  const retryFetch = () => {
    if (!hasValidRouteEventId) return;
    setLoadError(null);
    setIsLoadingEvent(true);

    getEventById(normalizedRouteEventId).then((result) => {
      if (!result) {
        setEventDetails(null);
        setLoadError("Unable to load event details.");
        setIsLoadingEvent(false);
        return;
      }

      setEventDetails(
        mapApiEventToEventDetails(normalizedRouteEventId, result)
      );
      setIsLoadingEvent(false);
    });
  };

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-background px-6 py-5 sm:py-4">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold">Event Management</h1>
            <p className="text-muted-foreground text-sm">
              Edit event details and manage attendees
            </p>
          </div>

          {isUcMainAdmin && (
            <div className="flex w-full justify-end sm:w-auto">
              <Button
                variant="outline"
                onClick={handleAttendeeSettings}
                className="cursor-not-allowed opacity-60"
              >
                <Settings className="mr-2 h-4 w-4" />
                Attendee Settings
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 px-6 py-4">
          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleBack();
                  }}
                  className="flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Events
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Event Management</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {isLoadingEvent ? (
            <div className="flex min-h-[240px] items-center justify-center">
              <div className="text-muted-foreground text-sm">
                Loading event...
              </div>
            </div>
          ) : loadError ? (
            <div className="space-y-3 rounded-lg border p-4">
              <p className="text-sm font-medium">{loadError}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={retryFetch}
                  className="cursor-pointer"
                >
                  Retry
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="cursor-pointer"
                >
                  Back to Events
                </Button>
              </div>
            </div>
          ) : !eventDetails ? (
            <div className="space-y-3 rounded-lg border p-4">
              <p className="text-sm font-medium">Event not found.</p>
              <Button
                variant="outline"
                onClick={handleBack}
                className="cursor-pointer"
              >
                Back to Events
              </Button>
            </div>
          ) : (
            <>
              {/* Event Details Section */}
              <div className="mb-20 flex flex-col items-stretch gap-6 lg:flex-row">
                {/* Event Image */}
                <div className="lg:w-1/3">
                  <div className="bg-muted relative h-full overflow-hidden rounded-lg">
                    <img
                      src={eventDetails.image}
                      alt={eventDetails.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                {/* Event Info */}
                <div className="h-full space-y-6 lg:w-2/3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-4 flex items-center gap-3">
                        <h2 className="text-3xl font-bold">
                          {eventDetails.title}
                        </h2>
                        <Badge
                          variant={
                            eventDetails.status === "ongoing"
                              ? "default"
                              : eventDetails.status === "ended"
                                ? "secondary"
                                : "outline"
                          }
                          className="capitalize"
                        >
                          {eventDetails.status}
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="mb-3 text-sm font-semibold">
                            Event details & description
                          </h3>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="flex gap-3">
                              <div className="bg-muted flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                                <Calendar className="text-muted-foreground h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium">
                                  {eventDetails.startDate}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                  {eventDetails.startTime}
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <div className="bg-muted flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                                <Calendar className="text-muted-foreground h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium">
                                  {eventDetails.endDate}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                  {eventDetails.endTime}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="bg-muted flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                            <MapPin className="text-muted-foreground h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">Cebu Coliseum</p>
                            <p className="text-muted-foreground text-sm">
                              Sanciangko St., Cebu City, Philippines
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {eventDetails.description}
                          </p>
                        </div>

                        {isUcMainAdmin && (
                          <div>
                            <Button
                              onClick={handleEditEvent}
                              variant="outline"
                              className="w-full cursor-not-allowed opacity-60"
                            >
                              Edit Event
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendees Section - campuses tabs */}
              <div className="space-y-4">
                <Tabs
                  value={activeCampusValue}
                  onValueChange={handleCampusChange}
                >
                  <div className="relative flex items-center">
                    {/* Left Arrow */}
                    <button
                      type="button"
                      onClick={() => scrollTabs("left")}
                      className={`bg-background z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border shadow-sm transition-opacity ${
                        canScrollLeft
                          ? "hover:bg-accent cursor-pointer opacity-100"
                          : "pointer-events-none opacity-0"
                      }`}
                      aria-label="Scroll tabs left"
                      tabIndex={canScrollLeft ? 0 : -1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    {/* Scrollable Tabs */}
                    <div
                      ref={tabsScrollRef}
                      className="scrollbar-hide overflow-x-auto scroll-smooth"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                    >
                      <TabsList className="inline-flex w-max gap-2 rounded-none bg-transparent px-2">
                        {isUcMainAdmin && (
                          <TabsTrigger
                            value="all"
                            className="mx-1 cursor-pointer rounded-none !bg-transparent px-4 py-3 whitespace-nowrap hover:bg-transparent focus:bg-transparent data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-[#1C9DDE] data-[state=active]:underline data-[state=active]:decoration-[#1C9DDE] data-[state=active]:decoration-2 data-[state=active]:underline-offset-11"
                          >
                            All Campuses
                          </TabsTrigger>
                        )}
                        {availableCampusCodes.map((campusCode) => (
                          <TabsTrigger
                            key={campusCode}
                            value={campusCode}
                            className="mx-1 cursor-pointer rounded-none !bg-transparent px-4 py-3 whitespace-nowrap hover:bg-transparent focus:bg-transparent data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-[#1C9DDE] data-[state=active]:underline data-[state=active]:decoration-[#1C9DDE] data-[state=active]:decoration-2 data-[state=active]:underline-offset-11"
                          >
                            {CAMPUS_CODE_TO_NAME[campusCode]}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>

                    {/* Right Arrow */}
                    <button
                      type="button"
                      onClick={() => scrollTabs("right")}
                      className={`bg-background z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border shadow-sm transition-opacity ${
                        canScrollRight
                          ? "hover:bg-accent cursor-pointer opacity-100"
                          : "pointer-events-none opacity-0"
                      }`}
                      aria-label="Scroll tabs right"
                      tabIndex={canScrollRight ? 0 : -1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  {isUcMainAdmin && (
                    <TabsContent value="all" className="mt-6">
                      <AttendeesTable
                        venue="All Campuses"
                        eventId={eventDetails.id}
                        campusCode="all"
                        adminCampus={user?.campus}
                        merch={eventDetails.merch}
                        eventStatus={eventDetails.status}
                        attendanceType={eventDetails.attendanceType}
                      />
                    </TabsContent>
                  )}
                  {availableCampusCodes.map((campusCode) => (
                    <TabsContent
                      key={campusCode}
                      value={campusCode}
                      className="mt-6"
                    >
                      <AttendeesTable
                        venue={CAMPUS_CODE_TO_NAME[campusCode]}
                        eventId={eventDetails.id}
                        campusCode={campusCode}
                        adminCampus={user?.campus}
                        merch={eventDetails.merch}
                        eventStatus={eventDetails.status}
                        attendanceType={eventDetails.attendanceType}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <AttendeeSettingsModal
        open={isAttendeeSettingsOpen}
        onOpenChange={setIsAttendeeSettingsOpen}
        venues={
          eventDetails?.venues ??
          DEFAULT_CAMPUSES.map((code) => CAMPUS_CODE_TO_NAME[code])
        }
        onSave={handleSaveAttendeeLimits}
      />
      <EditEventModal
        open={isEditEventOpen}
        onOpenChange={setIsEditEventOpen}
        eventData={{
          id: eventDetails?.id ?? "",
          title: eventDetails?.title ?? "",
          description: eventDetails?.description ?? "",
          location: eventDetails?.location ?? "",
          startDate: eventDetails?.startDate ?? "",
          image: eventDetails?.image ?? "",
        }}
      />
    </div>
  );
};

export default EventManagement;
