export interface DashboardCounts {
  onSaleProducts: number;
  students: number;
  orders: number;
  activeMembers: number;
}

export interface DashboardStatsResponse {
  dashboardCount: {
    courses: {
      BSIT: number;
      BSCS: number;
      ACT: number;
    };
    years: {
      year1: number;
      year2: number;
      year3: number;
      year4: number;
    };
  };
  studentCount: {
    all: number;
    request: number;
    deleted: number;
  };
  merchCount: number;
  pendingCount: number;
  activeMembershipCount: number;
  dailySales: Array<{
    product_name: string;
    totalQuantity: number;
    totalSubtotal: number;
  }>;
}

export interface YearLevelDatum {
  key: "year1" | "year2" | "year3" | "year4";
  label: string;
  shortLabel: string;
  value: number;
  color: string;
}

export interface CourseDatum {
  label: "BSIT" | "BSCS";
  value: number;
  color: string;
}

export interface RevenueDatum {
  label: string;
  previousLabel: string;
  current: number;
  previous: number;
}

export interface RevenueOrderDatum {
  total?: number;
  transaction_date?: string | Date;
  order_date?: string | Date;
}

export interface PendingOrderCount {
  product_name: string;
  total: number;
  yearCounts: number[];
}

export type PendingOrderSortField =
  | "product_name"
  | "total"
  | "year_1"
  | "year_2"
  | "year_3"
  | "year_4";

export interface PendingOrderSortRule {
  field: PendingOrderSortField;
  direction: "asc" | "desc";
}
