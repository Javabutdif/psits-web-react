export interface DashboardCounts {
  onSaleProducts: number;
  students: number;
  orders: number;
  activeMembers: number;
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
