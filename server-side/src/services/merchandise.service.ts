import { Merch } from "../models/merch.model";
import { Types } from "mongoose";
import { IMerch } from "../models/merch.interface";
import { AppError } from "../util/app.error.util";
import { IResponseMessage } from "../models/global.response.interface";

class MerchandiseService {
  //Number of published merchandise, it is used in the admin dashboard
  getPublishCount = async () => {
    const now = new Date();

    const count = await Merch.countDocuments({
      is_active: true,
      start_date: { $lte: now },
      end_date: { $gte: now },
    });
    if (!count) {
      throw new AppError("No items are available", 404);
    }
    return count;
  };
  //Check if product exist
  checkExist = async (product_id: Types.ObjectId) => {
    const result = await Merch.findById({ _id: product_id });
    if (!result) {
      throw new AppError("Product doesn't exist", 404);
    }

    if (this.checkAvailable(result) && this.checkStocks(result)) {
      return { status: true, data: result, message: "Product exist" };
    }
  };
  //Check if product is available
  checkAvailable = (product: IMerch) => {
    return product.is_active ? true : false;
  };
  //Check if stocks is sufficient
  checkStocks = (product: IMerch) => {
    return product.stocks > 0 ? true : false;
  };
  //Check if merchandise is expired
  checkExpired = async (product_id: Types.ObjectId) => {
    try {
      const result: any = await this.checkExist(product_id);

      //If not exist
      if (!result.status && !result.data) {
        return { status: false, message: result.message };
      }
      //Exist
      const currentDate = new Date(); //Depends on the local time of the server and pc
      //Check if expired
      const isExpired = currentDate > result.data.end_date;
      //Return the result using ternary operator
      return isExpired
        ? { status: true, message: "Item expired" }
        : { status: false, message: "Item is active" };
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  //
}

const merchandiseService = new MerchandiseService();
export { merchandiseService };
