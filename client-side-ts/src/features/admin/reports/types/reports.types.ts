export type ReportsTab = "membership" | "merchandise";

export type ReportsStatus = "idle" | "loading" | "error" | "success";

export interface MembershipReportRow {
  reference_code: string;
  id_number: string;
  name: string;
  course: string;
  year: string | number;
  date: string | Date;
  type: string;
  admin?: string;
  rfid?: string;
  total?: number;
}

export interface MerchandiseOrderDetail {
  _id: string;
  reference_code: string;
  student_name: string;
  id_number: string;
  course: string;
  year: string | number;
  product_name: string;
  batch?: string;
  size: string[];
  variation: string[];
  quantity: number;
  total: number;
  transaction_date: string | Date;
  rfid?: string;
}

export interface MerchandiseReportOrder {
  _id: string;
  order_details: MerchandiseOrderDetail[];
}

export interface MerchandiseSalesSummary {
  unitsSold: number;
  totalRevenue: number;
}

export interface ReportsFilters {
  id: string;
  name: string;
  rfid: string;
  course: string;
  year: string;
  type: string;
  productName: string;
  batch: string;
  size: string;
  color: string;
  dateFrom: string;
  dateTo: string;
}