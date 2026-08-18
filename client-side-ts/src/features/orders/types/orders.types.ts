export type OrdersTab = "pending" | "paid" | "refunded";
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
    image?: string;
    category?: string;
    batch?: string;
    limited?: boolean;
  }>;
  total: number;
  cash?: number;
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
  reference_code?: string;
  cash?: number;
}

export interface RefundDetail {
  _id: string;
  refund_id: string;
  order_id: string;
  order_reference: string;
  product_name: string;
  refund_price: number;
  refund_admin: string;
  refund_date: string | Date;
}

export interface PrintableOrderReceiptItem {
  product_name: string;
  batch?: string | number;
  sizes?: string[];
  variation?: string[];
  quantity: number;
  price?: number;
  sub_total: number;
}

export interface PrintableOrderReceipt {
  reference_code?: string;
  order_date?: string | Date;
  transaction_date?: string | Date;
  student_name?: string;
  id_number?: string;
  course?: string;
  year?: number;
  admin?: string;
  items: PrintableOrderReceiptItem[];
  cash: number;
  change: number;
  total: number;
  membership_discount?: boolean;
  promo_name?: string;
}
