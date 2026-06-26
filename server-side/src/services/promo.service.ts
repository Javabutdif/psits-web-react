import { Promo } from "../models/promo.model";
import { IPromoOrder } from "../models/orders.interface";
import mongoose, { Types, ClientSession } from "mongoose";
import { AppError } from "../util/app.error.util";
import { IPromo } from "../models/promo.interface";
import { PromoUsage } from "../models/promo.usage.model";
import { membership_status } from "../enums/status.enums";

class PromoService {
  //fetch Promo
  fetchPromo = async (promo_id: string) => {
    const result = await Promo.findOne({ promo_id });
    if (!result) {
      throw new AppError("Promo does not exist!", 404);
    }
    return result;
  };
  //Verify if the merchandise associated is in the promo eligibility
  verifyMerchPromo = (promo: IPromo, merchId: string): boolean => {
    return promo.selected_merchandise.some(
      (item) => item._id.toString() === merchId
    );
  };
  //Check if it is expired.
  isExpired = (promo: IPromo): boolean => {
    const currentDate = new Date();
    return currentDate < promo.start_date || currentDate > promo.end_date;
  };
  //Check if it is out of stockes
  checkStocks = (promo: IPromo): boolean => {
    return promo.quantity < 0 && promo.limit_type === "Limited";
  };
  //Check if its already in used.
  isAlreadyUsed = async (promo: any, merchId: string, id_number: string) => {
    const result = await PromoUsage.findOne({
      promo_id: promo._id,
      merch_id: new Types.ObjectId(merchId),
      id_number: id_number,
    });

    return result ? true : false;
  };
  checkPromoType = (promo: IPromo, requestor: any) => {
    switch (promo.type) {
      case "All Students":
        return { discount: promo.discount, message: "Verified Promo" };

      case "Organization Members":
        if (promo.selected_audience.includes(requestor.role)) {
          return { discount: promo.discount, message: "Verified Promo" };
        }
        break;
      case "Membership Holders":
        if (
          requestor.membershipStatus === membership_status.ACTIVE ||
          requestor.membershipStatus === membership_status.RENEWED
        ) {
          return { discount: promo.discount, message: "Verified Promo" };
        }
        break;

      case "Students":
        if (promo.selected_specific_students.includes(requestor.id_number)) {
          return { discount: promo.discount, message: "Verified Promo" };
        }
        break;
      default:
        return {
          discount: 0,
          message: "Invalid promo type",
        };
    }
  };
}

export const promoService = new PromoService();
