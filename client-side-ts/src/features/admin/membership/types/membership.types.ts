export type MembershipStatus = "ACTIVE" | "INACTIVE" | "ALL";

export type MembershipTerm = "MEMBERSHIP_TERM_FIRST" | "MEMBERSHIP_TERM_SECOND";

export interface HistoryRecord {
  _id: string;
  membership_id?: string;
  id_number: string;
  reference_code: string;
  type: string;
  name?: string;
  year?: number;
  course?: string;
  rfid?: string;
  date: string;
  admin: string;
  total: number;
}

export interface Membership {
  _id: string;
  membership_name: string;
  start_date: string;
  end_date: string;
  term_name: string;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMembershipFormData {
  membership_name: string;
  start_date: string;
  end_date: string;
  term_name: MembershipTerm;
}

export interface UpdateMembershipFormData {
  membership_name: string;
  start_date: string;
  end_date: string;
  term_name: MembershipTerm;
}

export interface MembershipFilters {
  search: string;
  status: MembershipStatus;
  type: string;
  term: string;
}

export interface MembershipSort {
  field: "name" | "startDate" | "endDate" | "status";
  direction: "asc" | "desc";
}

export interface MembershipTabCounts {
  total: number;
  active: number;
  inactive: number;
}

export interface MembershipReportFilters {
  name?: string;
  from?: string;
  to?: string;
}
