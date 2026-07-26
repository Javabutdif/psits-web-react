import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import { Promo } from "../models/promo.model";
import { PromoLog } from "../models/promo.log.model";
import { promoService } from "../services/promo.service";
import { AppError } from "../util/app.error.util";

class PromoController {
  // Verify promo (student-facing)
  verifyPromo = async (req: Request, res: Response) => {
    const { promo_id, merchId } = req.params;
    const id_number = req.userV2.idNumber;

    const result = await promoService.fetchPromo(promo_id);
    if (!result) {
      return res
        .status(404)
        .json({ message: "Promo is Expired or Out of Stocks!" });
    }
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

  // Create promo code (admin)
  create = async (req: Request, res: Response) => {
    try {
      await promoService.create(req.body, req.admin);
      res.status(200).json({ message: "Successfully created Promo Code!" });
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res
          .status(500)
          .json({ message: "Server error! " + (error as Error).message });
      }
    }
  };

  // Fetch all promos
  fetchAll = async (req: Request, res: Response) => {
    try {
      const promos = await promoService.fetchAll();
      if (!promos || promos.length === 0) {
        return res.status(404).json({ message: "No Promo Codes" });
      }
      console.log(promos);
      res.status(200).json({ promo: promos });
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Server error!" });
      }
    }
  };

  // Update promo code
  update = async (req: Request, res: Response) => {
    try {
      await promoService.update(req.body);
      res.status(200).json({ message: "Promo Code updated successfully!" });
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res
          .status(500)
          .json({ message: "Server error: " + (error as Error).message });
      }
    }
  };

  // Soft delete promo
  softDelete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid promo ID" });
      }
      const promo = await Promo.findByIdAndUpdate(
        new Types.ObjectId(id),
        { status: "Deleted" },
        { new: true }
      );
      if (!promo) {
        return res.status(404).json({ message: "Promo not found" });
      }
      res.status(200).json({ message: "Promo deleted successfully" });
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res
          .status(500)
          .json({ message: "Server error! " + (error as Error).message });
      }
    }
  };

  // Get promo logs
  getLogs = async (req: Request, res: Response) => {
    try {
      const log = await promoService.promoLog();
      if (!log || log.length === 0) {
        return res.status(404).json({ message: "No Promo Log" });
      }
      res.status(200).json({ log });
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Server error!" });
      }
    }
  };
}

export const promoController = new PromoController();
