const Cart = require("../models/CartModel");
const Student = require("../models/StudentModel");
const mongoose = require("mongoose");

const addCartController = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const {
    id_number,
    product_id,
    category,
    product_name,
    end_date,
    start_date,
    limited,
    price,
    quantity,
    sub_total,
    variation,
    sizes,
    batch,
    imageUrl1,
  } = req.body;

  try {
    const student = await Student.findOne({ id_number }).session(session);

    const productExists = student.cart.find(
      (item) => item.product_id.toString() === product_id
    );

    if (productExists) {
      const existingCart = await Cart.findOne({
        _id: productExists._id,
      }).session(session);

      if (existingCart) {
        await Cart.updateOne(
          { _id: productExists._id },
          {
            $set: {
              quantity: existingCart.quantity + quantity,
            },
          }
        ).session(session);

        const itemIndex = student.cart.findIndex(
          (item) => item.product_id.toString() === product_id
        );

        if (itemIndex > -1) {
          student.cart[itemIndex].quantity = existingCart.quantity + quantity;
          await student.save();
          await session.commitTransaction();
          session.endSession();

          res
            .status(200)
            .json({ message: "Added Item into the cart successfully" });
        }
      }
    } else {
      const newCart = new Cart({
        product_id,
        product_name,
        price,
        end_date,
        start_date,
        category,
        quantity,
        limited,
        sub_total,
        variation,
        sizes,
        batch,
        imageUrl1,
      });
      await newCart.save();

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      student.cart.push(newCart);
      await student.save();
      await session.commitTransaction();
      session.endSession();

      res
        .status(200)
        .json({ message: "Added Item into the cart successfully" });
    }
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    if (error.code === 11000) {
      res.status(400).json({ message: "Cannot add item in cart" });
    } else {
      console.error({ message: "Error saving new cart:", error });
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

const viewStudentCartController = async (req, res) => {
  const { id_number } = req.query;

  try {
    const student = await Student.findOne({
      id_number: id_number,
    });
    if (student.cart.length > 0) {
      res.status(200).json(student.cart);
    } else {
      res.status(400).json({ message: "No Records" });
    }
  } catch (error) {
    console.error("Error fetching Cart:", error);
    res.status(500).json("Internal Server Error");
  }
};

const deleteItemCartController = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { id_number, cart_id } = req.body;

  try {
    const result = await Student.findOneAndUpdate(
      { id_number: id_number },
      { $pull: { cart: { _id: cart_id } } },
      { new: true, useFindAndModify: false }
    ).session(session);

    const cartId = new ObjectId(cart_id);

    const cartResult = await Cart.findByIdAndDelete(cartId).session(session);

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

module.exports = {
  addCartController,
  viewStudentCartController,
  deleteItemCartController,
};
