export interface ApiErrorResponse {
  message?: string;
}

export interface Event {
  eventId?: string;
  eventName: string;
  eventImage?: string[];
  eventDate: string | Date;
  eventDescription?: string;
  attendanceType?: string;
  sessionConfig?: Record<string, unknown>;
  createdBy?: string;
  attendees?: Attendee[];
  status?: string;
  limit?: unknown[];
  sales_data?: unknown[];
  totalUnitsSold?: number;
  totalRevenueAll?: number;
  merch?: EventMerchMeta | null;
  [key: string]: unknown;
}

export interface EventSizeOption {
  custom: boolean;
  price: string;
}

export interface EventMerchMeta {
  category: string | null;
  type: string | null;
  selectedSizes: Record<string, EventSizeOption>;
  selectedVariations: string[];
}
// ─── Session Config Types ────────────────────────────────────────────────────
export interface SessionConfigEntry {
  enabled: boolean;
  timeRange: string;
}

export type SessionConfig = Record<string, SessionConfigEntry>;

// ─── Attendee Data for Frontend ──────────────────────────────────────────────
export interface AttendeeData {
  id_number: string;
  name: string;
  isAttended: boolean;
  attendance: Record<string, { attended: boolean; timestamp?: string | null }>;
}

// ─── Frontend EventData (mapped from Event API response) ────────────────────
export interface EventData {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  location?: string;
  date: Date;
  attendanceType: string;
  attendees: AttendeeData[];
  sessionConfig?: SessionConfig;
  isPast?: boolean;
}

export interface Attendee {
  id_number: string;
  name: string;
  email?: string;
  campus: string;
  course: string;
  year: number;
  attendance?: {
    morning?: {
      attended?: boolean;
      timestamp?: string | Date | null;
    };
    afternoon?: {
      attended?: boolean;
      timestamp?: string | Date | null;
    };
    evening?: {
      attended?: boolean;
      timestamp?: string | Date | null;
    };
  };
  confirmedBy?: string;
  shirtSize?: string;
  shirtPrice?: number;
  raffleIsRemoved?: boolean;
  raffleIsWinner?: boolean;
  transactBy?: string;
  transactDate?: string | Date | null;
  isPresent?: boolean;
  [key: string]: unknown;
}

export interface MerchData {
  _id?: string;
  name?: string;
  price?: number;
  stocks?: number;
  [key: string]: unknown;
}

export interface AttendeesResponse {
  data: Event & { attendees: Attendee[] };
  attendees: Attendee[];
  merch: MerchData;
}

export interface GetAttendeesParams {
  page?: number;
  limit?: number;
  search?: string;
  campus?: string;
  attendanceStatus?: Array<
    | "morning_attended"
    | "afternoon_attended"
    | "evening_attended"
    | "no_sessions_attended"
  >;
  course?: string[];
  yearLevel?: number[];
  registeredOn?: string;
  exportAll?: boolean;
}

export interface AttendeesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedAttendeesResponse {
  data: Attendee[];
  pagination: AttendeesPagination;
  access?: {
    isUcMainAdmin: boolean;
    campusScope: string;
  };
}

export interface EventCheckData {
  limit: number;
  currentCount: number;
  [key: string]: unknown;
}

export interface RaffleResponse {
  data: Attendee[];
  message: string;
}

// ── Statistics V2 Types ──────────────────────────────────────────────────

export interface YearLevelCounts {
  "1st": number;
  "2nd": number;
  "3rd": number;
  "4th": number;
}

export interface StatisticsSummary {
  totalRegistrations: number;
  totalRevenue: number;
  totalAttended: number;
  attendanceRate: number;
}

export interface DistributionData {
  registered: Record<string, number>;
  attended: Record<string, number>;
}

export interface YearLevelDistributionData {
  registered: YearLevelCounts;
  attended: YearLevelCounts;
}

export interface SessionAttendanceData {
  morning: number;
  afternoon: number;
  evening: number;
}

export interface CampusBreakdownEntry {
  campus: string;
  registrations: number;
  attended: number;
  revenue: number;
  unitsSold: number;
  yearLevelDistribution: YearLevelCounts;
}

export interface RegistrationTimelineEntry {
  date: string;
  count: number;
  cumulativeCount: number;
}

export interface EventStatisticsData {
  summary: StatisticsSummary;
  yearLevelDistribution: YearLevelDistributionData;
  courseDistribution: DistributionData;
  campusDistribution: DistributionData;
  sessionAttendance: SessionAttendanceData;
  campusBreakdown: CampusBreakdownEntry[];
  registrationTimeline: RegistrationTimelineEntry[];
}

export interface EventStatisticsResponse {
  data: EventStatisticsData;
  access: {
    isUcMainAdmin: boolean;
    campusScope: string;
  };
}

/** @deprecated Use EventStatisticsData instead */
export interface StatisticsData {
  totalAttendees: number;
  presentCount: number;
  [key: string]: unknown;
}

export interface CreateEventData {
  name: string;
  date: string;
  [key: string]: unknown;
}

export interface CreateEventResponse {
  message: string;
  eventId?: string;
  [key: string]: unknown;
}

export interface AddAttendeeFormData {
  eventId: string;
  attendeeId: string;
  name?: string;
  email?: string;
  campus?: string;
  course?: string;
  year?: number;
  shirtSize?: string;
  shirtPrice?: number;
  password?: string;
  [key: string]: unknown;
}

export interface AddAttendeeV2Payload {
  studentId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  course: string;
  yearLevel: string;
  shirtSize?: string;
  shirtPrice: number;
  password: string;
}

export interface AddAttendeeV2Response {
  message: string;
  data: {
    isNewStudent: boolean;
    emailSent?: boolean;
    attendee: {
      id_number: string;
      name: string;
      campus: string;
      course: string;
      year: number;
      shirtSize: string;
      shirtPrice: number;
    };
  };
}

export interface RemoveAttendeeFormData {
  eventId: string;
  attendeeId: string;
  [key: string]: unknown;
}

export interface UpdateSettingsFormData {
  [key: string]: unknown;
}

export interface RaffleWinnerResponse {
  message: string;
  winner?: Attendee;
  [key: string]: unknown;
}

export interface RemoveRaffleResponse {
  message: string;
  [key: string]: unknown;
}

// ─── Attendance V2 Types ─────────────────────────────────────────────────────

export interface MarkAttendanceV2Payload {
  campus: string;
  attendeeName: string;
  course: string;
  year: number;
}

export interface MarkAttendanceV2Response {
  message: string;
  session: string;
  data: {
    id_number: string;
    name: string;
    campus: string;
    attendance: Attendee["attendance"];
  };
  isNewAttendee: boolean;
}

/** Parsed QR code payload (JSON format v2) */
export interface QRCodePayloadV2 {
  v: number;
  eventId: string;
  studentId: string;
  name: string;
  campus: string;
  course: string;
  year: number;
}

// ─── Edit Attendee V2 Types ─────────────────────────────────────────────────

export interface EditableAttendeeData {
  id_number: string;
  baseIdNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  course: string;
  year: number;
  campus: string;
  shirtSize: string;
  shirtPrice: number;
}

export interface EditableAttendeeResponse {
  data: EditableAttendeeData;
}

export interface EditAttendeeV2Payload {
  adminPassword: string;
  confirmationPhrase: string;
  changes: {
    studentId?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    email?: string;
    course?: string;
    yearLevel?: string;
    shirtSize?: string;
    shirtPrice?: number;
  };
}

export interface EditAttendeeV2Response {
  message: string;
  data: {
    attendee: {
      id_number: string;
      name: string;
      campus: string;
      course: string;
      year: number;
      shirtSize: string;
      shirtPrice: number;
    };
  };
}

// ─── Change Attendee Password V2 Types ──────────────────────────────────────

export interface ChangeAttendeePasswordV2Payload {
  adminPassword: string;
  newPassword: string;
}

export interface ChangeAttendeePasswordV2Response {
  message: string;
}

// ─── Event Raffle V2 Types ──────────────────────────────────────

export type RaffleAttendeeDto = {
  attendeeId: string;
  id_number: string;
  name: string;
  campus: string;
  course: string;
  year: number;
};

export type GetRafflePoolResponse = {
  eligible: RaffleAttendeeDto[];
  winners: RaffleAttendeeDto[];
  totalEligible: number;
};

export type DrawRaffleWinnerResponse = {
  message: string;
  winner: RaffleAttendeeDto;
};

export interface RaffleQueryParams {
  campus?: string;
}
