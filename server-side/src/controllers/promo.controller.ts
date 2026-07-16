import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import { Promo } from "../models/promo.model";
import { PromoLog } from "../models/promo.log.model";
import { PromoUsage } from "../models/promo.usage.model";

import { promoCodeGenerator } from "../custom_function/code_generator";

export const createPromoCode = async (req: Request, res: Response) => {
  const {
    promoName,
    type,
    limitType,
    singleStudent,
    discount,
    quantity,
    startDate,
    endDate,
    selectedMerchandise,
  } = req.body;

  try {
    const parsedMerchandise = JSON.parse(req.body.selectedMerchandise);
    const parsedAudience = JSON.parse(req.body.selectedAudience);
    if (
      !promoName ||
      !type ||
      !limitType ||
      discount === undefined ||
      !startDate ||
      !endDate ||
      !selectedMerchandise ||
      !Array.isArray(parsedMerchandise) ||
      parsedMerchandise.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled." });
    }
    const uniqueMerchandise = Array.from(
      new Map(
        parsedMerchandise.map((item) => [item._id.toString(), item])
      ).values()
    );

    const newPromoCode = new Promo({
      promo_name: promoCodeGenerator(promoName),
      type,
      limit_type: limitType,
      one_person_limit: singleStudent === "yes" ? true : false,
      discount,
      start_date: startDate,
      end_date: endDate,
      selected_merchandise: uniqueMerchandise,
      selected_audience: type === "Members" ? parsedAudience : [],
      selected_specific_students: type == "Students" ? parsedAudience : [],
      quantity,
      created_by: req.admin.name,
    });
    await newPromoCode.save();
    res.status(200).json({ message: "Successfully created Promo Code!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error! " + error });
  }
};
export const updatePromoCode = async (req: Request, res: Response) => {
  const {
    promoId,
    promoName,
    type,
    limitType,
    singleStudent,
    discount,
    quantity,
    startDate,
    endDate,
    selectedMerchandise,
    selectedAudience,
  } = req.body;

  try {
    const parsedMerchandise = JSON.parse(selectedMerchandise);
    const parsedAudience = selectedAudience ? JSON.parse(selectedAudience) : [];

    if (
      !promoId ||
      !promoName ||
      !type ||
      !limitType ||
      discount === undefined ||
      !startDate ||
      !endDate ||
      !selectedMerchandise ||
      !Array.isArray(parsedMerchandise) ||
      parsedMerchandise.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled." });
    }

    const uniqueMerchandise = Array.from(
      new Map(
        parsedMerchandise.map((item) => [item._id.toString(), item])
      ).values()
    );

    const promo = await Promo.findById(new mongoose.Types.ObjectId(promoId));
    if (!promo) {
      return res.status(404).json({ message: "Promo not found!" });
    }

    promo.promo_name = promoName;
    promo.type = type;
    promo.limit_type = limitType;
    promo.one_person_limit = singleStudent === "yes";
    promo.discount = discount;
    promo.start_date = startDate;
    promo.end_date = endDate;
    promo.quantity = quantity;
    promo.selected_merchandise = uniqueMerchandise;
    promo.selected_audience = type === "Members" ? parsedAudience : [];
    promo.selected_specific_students =
      type === "Students" || type === "Specific" ? parsedAudience : [];

    await promo.save();

    res.status(200).json({ message: "Promo Code updated successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error: " + error });
  }
};

export const getAllPromoCode = async (req: Request, res: Response) => {
  try {
    const promo = await Promo.find({ status: "Active" });

    if (!promo) {
      res.status(404).json({ message: "No Promo Codes" });
    }
    res.status(200).json({ promo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error! " + error });
  }
};

export const deletePromo = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Server error! " + error.message });
  }
};
export const verifyPromo = async (req: Request, res: Response) => {
  try {
    const { promo_code, merchId } = req.params;

    const student = req.both;
    const currentDate = new Date();

    const promo = await Promo.findOne({ promo_name: promo_code });
    if (!promo || promo.status === "Deleted") {
      return res.status(404).json({ message: "Promo not found or deleted" });
    }

    if (!Types.ObjectId.isValid(merchId)) {
      return res.status(400).json({ message: "Invalid merchandise ID" });
    }

    if (currentDate < promo.start_date || currentDate > promo.end_date) {
      return res.status(400).json({ message: "Expired Promo Code" });
    }
    if (promo.quantity <= 0 && promo.limit_type === "Limited") {
      return res.status(400).json({ message: "Out of Stocks" });
    }

    const isIncluded = promo.selected_merchandise.some(
      (item) => item._id.toString() === merchId
    );

    if (!isIncluded) {
      return res.status(403).json({ message: "Merchandise not eligible" });
    }

    if (promo.limit_type === "Limited" && promo.one_person_limit) {
      const alreadyUsed = await PromoUsage.findOne({
        promo_id: promo._id,
        merch_id: new Types.ObjectId(merchId),
        id_number: student.id_number,
      });

      if (alreadyUsed) {
        return res
          .status(403)
          .json({ message: "You have already used this promo" });
      }
    }
    switch (promo.type) {
      case "All Students":
        return res
          .status(200)
          .json({ discount: promo.discount, message: "Verified Promo" });

      case "Members":
        if (promo.selected_audience.includes(student.role)) {
          return res
            .status(200)
            .json({ discount: promo.discount, message: "Verified Promo" });
        }
        break;

      case "Students":
        if (promo.selected_specific_students.includes(student.id_number)) {
          return res
            .status(200)
            .json({ discount: promo.discount, message: "Verified Promo" });
        }
        break;
    }

    res.status(403).json({ message: "Not Eligible" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

export const getPromoLog = async (req: Request, res: Response) => {
  try {
    const log = await PromoLog.find().sort({ date: -1 });

    if (!log) {
      res.status(404).json({ message: "No Promo Log" });
    }
    res.status(200).json({ log });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error! " + error });
  }
};
