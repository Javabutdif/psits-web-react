const express = require("express");
const Cart = require("../models/CartModel");
const Student = require("../models/StudentModel");
const { ObjectId } = require("mongodb");

const router = express.Router();

router.post("/add-cart", async (req, res) => {
  const {
    id_number,
    product_id,
    product_name,
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
    const newCart = new Cart({
      product_id,
      product_name,
      price,
      quantity,
      limited,
      sub_total,
      variation,
      sizes,
      batch,
      imageUrl1,
    });
    await newCart.save();

    const student = await Student.findOne({ id_number });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.cart.push(newCart);
    await student.save();

    res.status(200).json({ message: "Added Item into the cart successful" });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Cannot add item in cart" });
    } else {
      console.error({ message: "Error saving new cart:", error });
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

router.get("/view-cart", async (req, res) => {
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
});

router.put("/delete-item-cart", async (req, res) => {
  const { id_number, cart_id } = req.body;

  try {
    const result = await Student.findOneAndUpdate(
      { id_number: id_number },
      { $pull: { cart: { _id: cart_id } } },
      { new: true, useFindAndModify: false }
    );

    const cartId = new ObjectId(cart_id);

    const cartResult = await Cart.findByIdAndDelete(cartId);

    if (!result && !cartResult) {
      res
        .status(400)
        .json({ message: "Student not found or cart item not found." });
    } else {
      res.status(200).json({ message: "Cart item deleted successfully." });
    }
  } catch (error) {
    console.error("Error deleting cart item:", error);
  }
});

module.exports = router;
