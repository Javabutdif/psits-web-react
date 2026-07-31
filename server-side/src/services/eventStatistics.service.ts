import { IAttendee } from "../models/attendee.interface";
import { ISalesData } from "../models/event.interface";

// ── Constants ───────────────────────────────────────────────────

const ALL_CAMPUSES = [
  "UC_MAIN",
  "UC_BANILAD",
  "UC_LM",
  "UC_PT",
  "UC_CS",
] as const;

const YEAR_LEVEL_KEYS = ["1st", "2nd", "3rd", "4th"] as const;
type YearLevelKey = (typeof YEAR_LEVEL_KEYS)[number];

// ── Result Types ────────────────────────────────────────────────

interface YearLevelCounts {
  "1st": number;
  "2nd": number;
  "3rd": number;
  "4th": number;
}

interface SummaryStats {
  totalRegistrations: number;
  totalRevenue: number;
  totalAttended: number;
  attendanceRate: number;
}

interface DistributionCounts {
  registered: Record<string, number>;
  attended: Record<string, number>;
}

interface YearLevelDistribution {
  registered: YearLevelCounts;
  attended: YearLevelCounts;
}

interface SessionAttendanceCounts {
  morning: number;
  afternoon: number;
  evening: number;
}

interface CampusBreakdownEntry {
  campus: string;
  registrations: number;
  attended: number;
  revenue: number;
  unitsSold: number;
  yearLevelDistribution: YearLevelCounts;
}

interface RegistrationTimelineEntry {
  date: string;
  count: number;
  cumulativeCount: number;
}

export interface EventStatisticsResult {
  summary: SummaryStats;
  yearLevelDistribution: YearLevelDistribution;
  courseDistribution: DistributionCounts;
  campusDistribution: DistributionCounts;
  sessionAttendance: SessionAttendanceCounts;
  campusBreakdown: CampusBreakdownEntry[];
  registrationTimeline: RegistrationTimelineEntry[];
}

// ── Helpers ─────────────────────────────────────────────────────

const isAttendeePresent = (attendee: IAttendee): boolean => {
  const attendance = attendee.attendance;
  if (!attendance) return false;
  return [attendance.morning, attendance.afternoon, attendance.evening].some(
    (session) => Boolean(session?.attended)
  );
};

const matchesCampusScope = (
  attendeeCampus: string,
  campusFilter: string
): boolean => {
  return attendeeCampus === campusFilter;
};

const yearNumberToKey = (year: number): YearLevelKey | null => {
  if (year >= 1 && year <= 4) {
    return YEAR_LEVEL_KEYS[year - 1];
  }
  return null;
};

const emptyYearLevelCounts = (): YearLevelCounts => ({
  "1st": 0,
  "2nd": 0,
  "3rd": 0,
  "4th": 0,
});

const formatDateInTimeZone = (
  dateValue: Date,
  timeZone: string
): string | null => {
  if (Number.isNaN(dateValue.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(dateValue);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) return null;

  return `${year}-${month}-${day}`;
};

// ── Main Service Function ───────────────────────────────────────

/**
 * Computes all statistics for a given event, scoped to the
 * requester's campus access level.
 *
 * @param attendees  - The attendees array from the event document
 * @param salesData  - The sales_data array from the event document
 * @param campusScope - "all" for UC_MAIN admins, or a specific campus code
 */
export const computeEventStatistics = (
  attendees: IAttendee[],
  salesData: ISalesData[],
  campusScope: "all" | string
): EventStatisticsResult => {
  // Scope attendees by campus if needed
  const scopedAttendees =
    campusScope === "all"
      ? attendees
      : attendees.filter((a) => matchesCampusScope(a.campus, campusScope));

  // ── Summary ─────────────────────────────────────────────────
  const totalRegistrations = scopedAttendees.length;
  const totalRevenue = scopedAttendees.reduce(
    (sum, a) => sum + (a.shirtPrice || 0),
    0
  );
  const attendedAttendees = scopedAttendees.filter(isAttendeePresent);
  const totalAttended = attendedAttendees.length;
  const attendanceRate =
    totalRegistrations > 0
      ? Math.round((totalAttended / totalRegistrations) * 100)
      : 0;

  // ── Year Level Distribution ─────────────────────────────────
  const yearRegistered = emptyYearLevelCounts();
  const yearAttended = emptyYearLevelCounts();

  for (const attendee of scopedAttendees) {
    const key = yearNumberToKey(attendee.year);
    if (key) {
      yearRegistered[key]++;
      if (isAttendeePresent(attendee)) {
        yearAttended[key]++;
      }
    }
  }

  // ── Course Distribution ─────────────────────────────────────
  const courseRegistered: Record<string, number> = {};
  const courseAttended: Record<string, number> = {};

  for (const attendee of scopedAttendees) {
    const course = attendee.course || "Unknown";
    courseRegistered[course] = (courseRegistered[course] || 0) + 1;
    if (isAttendeePresent(attendee)) {
      courseAttended[course] = (courseAttended[course] || 0) + 1;
    }
  }

  // ── Campus Distribution ─────────────────────────────────────
  const campusRegistered: Record<string, number> = {};
  const campusAttended: Record<string, number> = {};

  for (const attendee of scopedAttendees) {
    const campus = attendee.campus || "Unknown";
    campusRegistered[campus] = (campusRegistered[campus] || 0) + 1;
    if (isAttendeePresent(attendee)) {
      campusAttended[campus] = (campusAttended[campus] || 0) + 1;
    }
  }

  // ── Session Attendance ──────────────────────────────────────
  let morningCount = 0;
  let afternoonCount = 0;
  let eveningCount = 0;

  for (const attendee of scopedAttendees) {
    const attendance = attendee.attendance;
    if (!attendance) continue;
    if (attendance.morning?.attended) morningCount++;
    if (attendance.afternoon?.attended) afternoonCount++;
    if (attendance.evening?.attended) eveningCount++;
  }

  // ── Campus Breakdown ────────────────────────────────────────
  const campusesInScope =
    campusScope === "all"
      ? ALL_CAMPUSES
      : ALL_CAMPUSES.filter((c) => matchesCampusScope(c, campusScope));

  const campusBreakdown: CampusBreakdownEntry[] = campusesInScope.map(
    (campus) => {
      const campusAttendees = scopedAttendees.filter(
        (a) => a.campus === campus
      );
      const campusSalesEntry = salesData.find((s) => s.campus === campus);
      const yearLevels = emptyYearLevelCounts();

      for (const attendee of campusAttendees) {
        const key = yearNumberToKey(attendee.year);
        if (key) yearLevels[key]++;
      }

      return {
        campus,
        registrations: campusAttendees.length,
        attended: campusAttendees.filter(isAttendeePresent).length,
        revenue: campusSalesEntry?.totalRevenue ?? 0,
        unitsSold: campusSalesEntry?.unitsSold ?? 0,
        yearLevelDistribution: yearLevels,
      };
    }
  );

  // ── Registration Timeline ───────────────────────────────────
  const dateCounts: Record<string, number> = {};

  for (const attendee of scopedAttendees) {
    if (!attendee.transactDate) continue;
    const date = new Date(attendee.transactDate);
    const dateStr = formatDateInTimeZone(date, "Asia/Manila");
    if (dateStr) {
      dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
    }
  }

  const sortedDates = Object.keys(dateCounts).sort();
  let cumulative = 0;
  const registrationTimeline: RegistrationTimelineEntry[] = sortedDates.map(
    (date) => {
      cumulative += dateCounts[date];
      return {
        date,
        count: dateCounts[date],
        cumulativeCount: cumulative,
      };
    }
  );

  return {
    summary: {
      totalRegistrations,
      totalRevenue,
      totalAttended,
      attendanceRate,
    },
    yearLevelDistribution: {
      registered: yearRegistered,
      attended: yearAttended,
    },
    courseDistribution: {
      registered: courseRegistered,
      attended: courseAttended,
    },
    campusDistribution: {
      registered: campusRegistered,
      attended: campusAttended,
    },
    sessionAttendance: {
      morning: morningCount,
      afternoon: afternoonCount,
      evening: eveningCount,
    },
    campusBreakdown,
    registrationTimeline,
  };
};
