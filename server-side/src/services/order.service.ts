import { Orders } from "../models/orders.model";
import { IOrders } from "../models/orders.interface";
import { startOfDay, endOfDay } from "date-fns";
import { AppError } from "../util/app.error.util";
class OrderService {
  //Pending Order Count
  getPendingCount = async () => {
    const count = await Orders.countDocuments({
      order_status: "Pending",
    });
    if (!count) {
      throw new AppError("No orders", 404);
    }
    return count;
  };
  //Admin Daily Sales
  getDailySales = async () => {
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
    if (!result) {
      throw new AppError("No orders!", 404);
    }
    return result;
  };
  //Update inside the order with dynamic $set of query
  updateOneDynamic = async (first_params: any, second_params: any) => {
    const result = await Orders.updateMany(
      { first_params },
      { $set: second_params }
    );

    if (result.matchedCount === 0) {
      throw new AppError("No orders updated!", 404);
    }

    if (result.modifiedCount === 0) {
      return { status: true, message: "No changes made" };
    }

    return { status: true, message: "Orders updated successfully" };
  };
}

const orderService = new OrderService();
export { orderService };
