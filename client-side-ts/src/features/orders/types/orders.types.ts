export type OrdersTab = "pending" | "paid";
export type OrdersStatus = "idle" | "loading" | "error" | "success";

export interface OrderRow {
  _id: string;
  id_number: string;
  rfid?: string;
  student_name: string;
  course: string;
  year: number;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
    sub_total: number;
    variation?: string[];
    sizes?: string[];
    imageUrl1?: string;
    category?: string;
    batch?: string;
    limited?: boolean;
  }>;
  total: number;
  order_date: string | Date;
  transaction_date?: string | Date;
  order_status: string;
  reference_code?: string;
  admin?: string;
  membership_discount?: boolean;
  promo?: { promo_name: string; promo_discount: boolean } | null;
}

export interface PaginatedOrdersResponse {
  data: OrderRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApprovePayload {
  order_id: string;
  reference_code: string;
  cash: number;
  transaction_date: string;
  admin?: string;
}
