import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import { Promo } from "../models/promo.model";
import { PromoLog } from "../models/promo.log.model";
import { PromoUsage } from "../models/promo.usage.model";
import { promoService } from "../services/promo.service";
import { promoCodeGenerator } from "../custom_function/code_generator";
import { AppError } from "../util/app.error.util";

class PromoController {
  //Verify promo from the frontend
  verifyPromo = async (req: Request, res: Response) => {
    const { promo_id, merchId } = req.params;
    const id_number = req.userV2.idNumber;

    const result = await promoService.fetchPromo(promo_id);
    if (!result) {
      return res
        .status(404)
        .json({ message: "Promo is Expired or Out of Stocks!" });
    }
    //Check validation
    if (!promoService.verifyMerchPromo(result, merchId)) {
      return res.status(404).json({ message: "Merchandise not eligible" });
    }
    if (promoService.isExpired(result)) {
      return res.status(404).json({ message: "Promo code Expired!" });
    }
    if (promoService.checkStocks(result)) {
      return res.status(404).json({ message: "Promo Out of Stocks!" });
    }
    if (await promoService.isAlreadyUsed(result, merchId, id_number)) {
      return res
        .status(404)
        .json({ message: "You've already used this promo" });
    }
    const promoDiscount = promoService.checkPromoType(result, req.userV2);

    return res.status(200).json(promoDiscount);
  };
}

export const promoController = new PromoController();
