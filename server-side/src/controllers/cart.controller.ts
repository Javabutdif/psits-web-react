import { CartItem } from "../models/cart.model";
import { ICart } from "../models/cart.interface";
import { Student, IStudentDocument } from "../models/student.model";
import mongoose, { Types } from "mongoose";
import { Request, Response } from "express";
import { Merch } from "../models/merch.model";

export const addCartController = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { id_number, product_id, quantity, variation, sizes } = req.body;

  try {
    const hasMissingFields = !id_number || !product_id || !quantity;
    if (hasMissingFields) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Missing required fields" });
    }

    const product = await Merch.findById(product_id).session(session);
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Product not found" });
    }

    const currentDate = new Date();
    if (!product.is_active) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Product is not available" });
    }

    const isExpired = product.end_date && currentDate > product.end_date;
    if (isExpired) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Product is no longer available" });
    }

    const isStockInsufficient = product.stocks < quantity;
    if (isStockInsufficient) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: `Insufficient stock. Available: ${product.stocks}, Requested: ${quantity}`,
      });
    }

    const student = await Student.findOne({ id_number }).session(session);
    if (!student) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Student not found" });
    }

    let actualPrice = product.price;

    // If item has sizes and product has selectedSizes, check for custom pricing
    if (sizes && sizes.length > 0 && product.selectedSizes) {
      const selectedSize = Array.isArray(sizes[0]) ? sizes[0] : sizes;
      const sizeConfig = product.selectedSizes.get(selectedSize);

      if (sizeConfig && sizeConfig.price) {
        actualPrice = parseFloat(sizeConfig.price);
      }
    }

    const sub_total = actualPrice * quantity;

    const cartItemData = {
      product_id,
      product_name: product.name,
      price: actualPrice,
      end_date: product.end_date,
      start_date: product.start_date,
      category: product.category,
      quantity,
      limited: product.control === "limited-purchase" ? true : false,
      sub_total,
      variation,
      sizes,
      batch: product.batch,
      imageUrl1: product.imageUrl?.[0] ?? null, // Get first image from product
    };

    // Check if product already exists in cart
    const productExists = student.cart.find(
      (item) => item.product_id.toString() === product_id
    );

    if (productExists) {
      // Update existing cart item
      const existingCart = await CartItem.findOne({
        _id: productExists._id,
      }).session(session);

      if (existingCart) {
        const newQuantity = existingCart.quantity + quantity;
        const newSubTotal = actualPrice * newQuantity;

        const isStockInsufficient = product.stocks < newQuantity;
        // Check if total quantity doesn't exceed stock
        if (isStockInsufficient) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            message: `Cannot add ${quantity} more items. Current cart: ${existingCart.quantity}, Available stock: ${product.stocks}`,
          });
        }

        await CartItem.updateOne(
          { _id: productExists._id },
          {
            $set: {
              quantity: newQuantity,
              sub_total: newSubTotal,
              product_name: product.name,
              price: actualPrice,
              imageUrl1: product.imageUrl?.[0],
            },
          }
        ).session(session);

        const itemIndex = student.cart.findIndex(
          (item) => item.product_id.toString() === product_id
        );

        if (itemIndex > -1) {
          student.cart[itemIndex].quantity = newQuantity;
          student.cart[itemIndex].sub_total = newSubTotal;
          await student.save({ session });
        }

        await session.commitTransaction();
        session.endSession();
        res.status(200).json({
          message: "Updated cart item successfully",
          quantity: newQuantity,
          sub_total: newSubTotal,
        });
      } else {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "Cart item not found" });
      }
    } else {
      // Create new cart item
      const newCart = new CartItem(cartItemData);
      await newCart.save({ session });

      // Add to student's cart
      student.cart.push(newCart);
      await student.save({ session });

      await session.commitTransaction();
      session.endSession();
      res.status(200).json({
        message: "Added item to cart successfully",
        cart_item_id: newCart._id,
        sub_total: sub_total,
      });
    }
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    if (error.code === 11000) {
      res
        .status(400)
        .json({ message: "Cannot add item to cart - duplicate entry" });
    } else {
      console.error("Error adding to cart:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error: " + error.message });
    }
  }
};

export const viewStudentCartController = async (
  req: Request,
  res: Response
) => {
  const { id_number } = req.query;

  try {
    const student: IStudentDocument | null = await Student.findOne({
      id_number: id_number,
    });

    if (student) {
      if (student.cart.length > 0) {
        res.status(200).json(student.cart);
        return;
      } else {
        res.status(200).json([]);
        return;
      }
    } else {
      res.status(400).json({ message: "No Records" });
    }
  } catch (error) {
    console.error("Error fetching Cart:", error);
    res.status(500).json("Internal Server Error");
  }
};

export const deleteItemCartController = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { id_number, cart_id } = req.body;

  try {
    const result: IStudentDocument | null = await Student.findOneAndUpdate(
      { id_number: id_number },
      { $pull: { cart: { _id: cart_id } } },
      { new: true, useFindAndModify: false }
    ).session(session);

    const cartId = new Types.ObjectId(cart_id);

    const cartResult = await CartItem.findByIdAndDelete(cartId).session(
      session
    );

    if (!result && !cartResult) {
      await session.abortTransaction();
      session.endSession();
      res
        .status(400)
        .json({ message: "Student not found or cart item not found." });
    } else {
      await session.commitTransaction();
      session.endSession();
      res.status(200).json({ message: "Cart item deleted successfully." });
    }
  } catch (error) {
    console.error("Error deleting cart item:", error);
  }
};
