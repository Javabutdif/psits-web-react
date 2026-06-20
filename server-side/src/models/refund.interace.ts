import Types from "mongoose";
export interface IRefund{
    refund_id: String,
    order_id: Types.ObjectId,
    order_reference: String,
    product_id: Types.ObjectId,
    product_name: String,
    refund_price: number,
    refund_admin: String,
    refund_admin_id: String,
    refund_date: Date,

}