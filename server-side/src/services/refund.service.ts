import { Refund } from "../models/refund.model";

class RefundService {
  //Refund Order Service
  createRefund = async (order: any, requestor: any) => {
    await Refund.create({
      refund_id: this.generateRefundCode(),
      order_id: order._id,
      order_reference: order.reference_code,
      product_id: order.product_id,
      product_name: order.product_name,
      refund_price: order.refund_price,
      refund_admin: requestor.refund_admin,
      refund_admin_id: requestor.refund_admin_id,
      refund_date: new Date(),
    });
  };
  //Generate Refund Code Service
  generateRefundCode = () => {
    const timestamp = Date.now().toString(36).toUpperCase();

    const randomString = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    return `REF-${timestamp}-${randomString}`;
  };
}

export const refundService = new RefundService();
