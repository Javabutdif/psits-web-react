import { Orders } from "../models/orders.model";
import { IOrders } from "../models/orders.interface";
import { startOfDay, endOfDay } from "date-fns";
class OrderService {
  //Pending Order Count
  getPendingCount = async () => {
    try {
      const count = await Orders.countDocuments({
        order_status: "Pending",
      });
      return count;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  //Admin Daily Sales
  getDailySales = async () => {
    try {
      const currentDate = new Date();
      const startOfDayDate = startOfDay(currentDate);
      const endOfDayDate = endOfDay(currentDate);

      const result: IOrders[] = await Orders.aggregate([
        {
          $match: {
            transaction_date: {
              $gte: startOfDayDate,
              $lte: endOfDayDate,
            },
            order_status: "Paid",
          },
        },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product_name",
            totalQuantity: { $sum: "$items.quantity" },
            totalSubtotal: { $sum: "$items.sub_total" },
          },
        },
        {
          $project: {
            product_name: "$_id",
            totalQuantity: 1,
            totalSubtotal: 1,
            _id: 0,
          },
        },
      ]);

      return result;
    } catch (error) {
      console.error("Error fetching orders by date:", error);
      throw error;
    }
  };
  //Update inside the order with dynamic $set of query
  updateOneDynamic = async (first_params: any, second_params: any) => {
    try {
      const result = await Orders.updateMany(
        { first_params },
        { $set: second_params }
      );

      if (result.matchedCount === 0) {
        return { success: false, message: "Cannot update Orders" };
      }

      if (result.modifiedCount === 0) {
        return { status: true, message: "No changes made" };
      }

      return { status: true, message: "Orders updated successfully" };
    } catch (error) {
      return { status: false, message: "Error updating student", error };
    }
  };
}

const orderService = new OrderService();
export { orderService };
