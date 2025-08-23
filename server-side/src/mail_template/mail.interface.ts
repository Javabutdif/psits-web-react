export interface IMembershipRequest {
  name: string;
  reference_code: string;
  cash: number;
  total: number;
  course: string;
  year: number;
  admin: string;
  date: string;
  change: number;
}
export interface IOrderReceipt {
  reference_code: string;
  transaction_date: Date;
  student_name: string;
  rfid?: string;
  course: string;
  year: number;
  admin: string;
  items: Array<String>;
  cash: number;
  total: number;
}
