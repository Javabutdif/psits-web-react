import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  ChartSpline,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  SummaryCards,
  CampusDistributionChart,
  YearLevelDistributionChart,
  CourseDistributionChart,
  SessionAttendanceChart,
  RegistrationTimelineChart,
  CampusRevenueCards,
  CampusYearLevelBreakdown,
  StatisticsLoadingSkeleton,
} from "@/features/admin/event-statistics";
import {
  getEventById,
  getEventStatisticsV2,
} from "@/features/events/api/eventService";
import type {
  Event as ApiEvent,
  EventStatisticsData,
} from "@/features/events/types/event.types";
import { formatEventDateLabel } from "@/utils/date-manila";

const formatEventDate = (value: unknown): string => {
  if (!value) return "TBA";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return formatEventDateLabel(date);
};

const normalizeStatus = (value: unknown): string => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (normalized === "ongoing") return "ongoing";
  if (normalized === "upcoming") return "upcoming";
  return "ended";
};

const EventStatisticsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const normalizedEventId = eventId?.trim() ?? "";
  const hasValidEventId = normalizedEventId.length > 0;

  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [statistics, setStatistics] = useState<EventStatisticsData | null>(
    null
  );
  const [campusScope, setCampusScope] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    hasValidEventId ? null : "Missing event ID from route."
  );

  useEffect(() => {
    if (!hasValidEventId) return;

    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      const [eventResult, statsResult] = await Promise.all([
        getEventById(normalizedEventId),
        getEventStatisticsV2(normalizedEventId),
      ]);

      if (!isMounted) return;

      if (!eventResult) {
        setError("Unable to load event details.");
        setIsLoading(false);
        return;
      }

      if (!statsResult) {
        setError("Unable to load statistics.");
        setIsLoading(false);
        return;
      }

      setEvent(eventResult);
      setStatistics(statsResult.data);
      setCampusScope(statsResult.access.campusScope);
      setIsLoading(false);
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [hasValidEventId, normalizedEventId]);

  const handleBack = () => {
    navigate("/admin/events");
  };

  const handleBackToEvent = () => {
    navigate(`/admin/events/${normalizedEventId}`);
  };

  const retryFetch = () => {
    if (!hasValidEventId) return;
    setError(null);
    setIsLoading(true);

    Promise.all([
      getEventById(normalizedEventId),
      getEventStatisticsV2(normalizedEventId),
    ]).then(([eventResult, statsResult]) => {
      if (!eventResult) {
        setError("Unable to load event details.");
        setIsLoading(false);
        return;
      }

      if (!statsResult) {
        setError("Unable to load statistics.");
        setIsLoading(false);
        return;
      }

      setEvent(eventResult);
      setStatistics(statsResult.data);
      setCampusScope(statsResult.access.campusScope);
      setIsLoading(false);
    });
  };

  const eventTitle = event?.eventName ?? "Event";
  const eventDate = formatEventDate(event?.eventDate);
  const eventStatus = normalizeStatus(event?.status);

  const sectionAnimation = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: "easeOut" as const },
  };

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100/80">
      {/* Header */}
      <div className="bg-background/80 border-b border-slate-200/60 px-6 py-5 backdrop-blur-md sm:py-4">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Event Statistics
            </h1>
            <p className="text-muted-foreground text-sm">
              View registration, attendance, and revenue insights
              {campusScope !== "all" && (
                <span className="ml-1 font-medium">
                  — {campusScope} campus only
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 px-6 py-5">
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
                <BreadcrumbLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleBackToEvent();
                  }}
                >
                  {eventTitle}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Statistics</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {isLoading ? (
            <StatisticsLoadingSkeleton />
          ) : error ? (
            <Card className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm font-medium text-slate-700">{error}</p>
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
              </CardContent>
            </Card>
          ) : !statistics ? (
            <Card className="rounded-2xl border border-slate-200/80 bg-white/90 pt-5 shadow-sm">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm font-medium text-slate-700">
                  No statistics available.
                </p>
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="cursor-pointer"
                >
                  Back to Events
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Event info bar */}
              <motion.div
                initial={sectionAnimation.initial}
                animate={sectionAnimation.animate}
                transition={sectionAnimation.transition}
                className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h2 className="text-2xl leading-tight font-bold text-slate-800">
                      {eventTitle}
                    </h2>
                    <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {eventDate}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {campusScope === "all"
                          ? "All campuses"
                          : `${campusScope} campus scope`}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      eventStatus === "ongoing"
                        ? "default"
                        : eventStatus === "ended"
                          ? "secondary"
                          : "outline"
                    }
                    className="rounded-full px-3 py-1 text-sm capitalize"
                  >
                    {eventStatus}
                  </Badge>
                </div>
              </motion.div>

              {/* Summary cards */}
              <motion.div
                initial={sectionAnimation.initial}
                animate={sectionAnimation.animate}
                transition={{ ...sectionAnimation.transition, delay: 0.05 }}
              >
                <SummaryCards summary={statistics.summary} />
              </motion.div>

              <motion.div
                initial={sectionAnimation.initial}
                animate={sectionAnimation.animate}
                transition={{ ...sectionAnimation.transition, delay: 0.1 }}
                className="grid grid-cols-1 gap-4 xl:grid-cols-2"
              >
                <CampusDistributionChart data={statistics.campusDistribution} />
                <SessionAttendanceChart data={statistics.sessionAttendance} />
              </motion.div>

              <motion.div
                initial={sectionAnimation.initial}
                animate={sectionAnimation.animate}
                transition={{ ...sectionAnimation.transition, delay: 0.15 }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <ChartSpline className="h-4 w-4 text-[#0E4A67]" />
                  <h3 className="text-base font-semibold text-slate-700">
                    Detailed Distribution Insights
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  <CourseDistributionChart
                    data={statistics.courseDistribution}
                  />
                  <YearLevelDistributionChart
                    data={statistics.yearLevelDistribution}
                  />
                </div>
              </motion.div>

              {/* Registration timeline */}
              <motion.div
                initial={sectionAnimation.initial}
                animate={sectionAnimation.animate}
                transition={{ ...sectionAnimation.transition, delay: 0.2 }}
              >
                <RegistrationTimelineChart
                  data={statistics.registrationTimeline}
                />
              </motion.div>

              {/* Campus revenue section */}
              <motion.div
                initial={sectionAnimation.initial}
                animate={sectionAnimation.animate}
                transition={{ ...sectionAnimation.transition, delay: 0.25 }}
              >
                <CampusRevenueCards
                  campusBreakdown={statistics.campusBreakdown}
                />
              </motion.div>

              {/* Campus year level breakdown */}
              <motion.div
                initial={sectionAnimation.initial}
                animate={sectionAnimation.animate}
                transition={{ ...sectionAnimation.transition, delay: 0.3 }}
              >
                <CampusYearLevelBreakdown
                  campusBreakdown={statistics.campusBreakdown}
                />
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventStatisticsPage;
