const express = require("express");
const Merch = require("../models/MerchModel");
const Student = require("../models/StudentModel");
const Orders = require("../models/OrdersModel");
const { default: mongoose } = require("mongoose");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const { ObjectId } = require("mongodb");
require("dotenv").config();
const authenticateToken = require("../middlewares/authenticateToken");

const router = express.Router();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, `merchandise/${Date.now()}_${file.originalname}`);
    },
  }),
});

router.post("/",authenticateToken, upload.array("images", 3), async (req, res) => {
  const {
    name,
    price,
    stocks,
    batch,
    description,
    selectedVariations,
    selectedSizes,
    created_by,
    start_date,
    end_date,
    category,
    type,
    control,
  } = req.body;

  // Get the URLs of the uploaded images
  const imageUrl = req.files.map((file) => file.location);

  try {
    const newMerch = new Merch({
      name,
      price,
      stocks,
      batch,
      description,
      selectedVariations: selectedVariations.split(","),
      selectedSizes: selectedSizes.split(","),
      created_by,
      start_date,
      end_date,
      category,
      type,
      control,
      imageUrl,
    });

    await newMerch.save();

    res.status(201).json("Merch Addition Successful");
  } catch (error) {
    console.error("Error saving new merch:", error.message);
    res.status(500).send(error.message);
  }
});

router.get("/retrieve", authenticateToken, async (req, res) => {
  try {
    const merches = await Merch.find({
      is_active: true,
    });
    res.status(200).json(merches);
  } catch (error) {
    console.error("Error fetching merches:", error.message);
    res.status(500).send(error.message);
  }
});
router.get("/retrieve-admin", authenticateToken, async (req, res) => {
  try {
    const merches = await Merch.find({});
    res.status(200).json(merches);
  } catch (error) {
    console.error("Error fetching merches:", error.message);
    res.status(500).send(error.message);
  }
});

router.put(
  "/update/:_id",
  authenticateToken,
  upload.array("images", 3),
  async (req, res) => {
    const {
      name,
      price,
      stocks,
      batch,
      description,
      selectedVariations,
      selectedSizes,
      start_date,
      end_date,
      category,
      type,
      control,
      sales_data,
    } = req.body;

    const id = req.params._id;

    let imageUrl = req.files.map((file) => file.location);

    try {
      const existingMerch = await Merch.findById(id);
      if (!existingMerch) {
        console.error("Merch not found");
        return res.status(404).send("Merch not found");
      }

      if (imageUrl.length === 0) {
        imageUrl = existingMerch.imageUrl;
      }

      const updateFields = {
        name: name,
        price: price,
        stocks: stocks,
        batch: batch,
        description: description,
        selectedVariations: selectedVariations.split(","),
        selectedSizes: selectedSizes.split(","),
        start_date: start_date,
        end_date: end_date,
        category: category,
        type: type,
        control: control,
        imageUrl: imageUrl,
      };

      if (sales_data) {
        for (const key in sales_data) {
          if (sales_data.hasOwnProperty(key)) {
            updateFields[`sales_data.${key}`] = sales_data[key];
          }
        }
      }

      const result = await Merch.updateOne({ _id: id }, { $set: updateFields });

      if (result.matchedCount === 0) {
        console.error("Merch not found");
        return res.status(404).send("Merch not found");
      }

      const students = await Student.find({ "cart.product_id": id });

      for (const student of students) {
        for (let item of student.cart) {
          if (item.product_id.toString() === id) {
            item.product_name = name;
            item.price = price;
            item.sub_total = price * item.quantity;
            item.imageUrl1 = imageUrl[0];
            item.start_date = start_date;
            item.end_date = end_date;
            item.category = category;
            item.batch = batch;
            item.limited = control === "limited-purchase" ? true : false;
            item.quantity = control === "limited-purchase" ? 1 : item.quantity;
          }
        }

        await student.save();
      }
      const orders = await Orders.find({
        "items.product_id": id,
        order_status: "Pending",
      });

      for (const order of orders) {
        let newTotal = 0;

        for (let item of order.items) {
          if (item.product_id.toString() === id) {
            item.product_name = name;
            item.price = price;

            item.imageUrl1 = imageUrl[0];

            item.category = category;
            item.batch = batch;
            item.limited = control === "limited-purchase" ? true : false;
            item.quantity = control === "limited-purchase" ? 1 : item.quantity;
            item.sub_total = price * item.quantity;
          }

          newTotal += item.sub_total;
        }

        order.total = newTotal;

        await order.save();
      }
      res.status(200).send("Merch, carts, and orders updated successfully");
    } catch (error) {
      console.error("Error updating merch, carts, and orders:", error.message);
      res.status(500).send(error.message);
    }
  }
);

// DELETE merch by id (soft)
router.put("/delete-soft", authenticateToken, async (req, res) => {
  const { _id } = req.body;

  try {
    const product_id = new ObjectId(_id);

    const result = await Merch.updateOne(
      { _id: product_id },
      { $set: { is_active: false } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Merch not found" });
    }

    res.status(200).json({ message: "Merch deleted successfully" });
  } catch (error) {
    console.error("Error deleting merch:", error.message);
    res.status(500).send("Error deleting merch");
  }
});
//publish merch
router.put("/publish", authenticateToken, async (req, res) => {
  const { _id } = req.body;

  try {
    const product_id = new ObjectId(_id);

    const result = await Merch.updateOne(
      { _id: product_id },
      { $set: { is_active: true } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Merch not found" });
    }

    res.status(200).json({ message: "Merch deleted successfully" });
  } catch (error) {
    console.error("Error deleting merch:", error.message);
    res.status(500).send("Error deleting merch");
  }
});
// ADD merch to cart as Student
router.put(
  "/add-to-cart/:student_id/:merch_id",
  authenticateToken,
  async (req, res) => {
    const { student_id, merch_id } = req.params;

    try {
      // Find the student by ID
      const student = await Student.findById(student_id);
      if (!student) {
        console.error("Not logged in! User not found.");
        return res
          .status(404)
          .json({ message: "Not logged in! User not found." });
      }

      // Convert merch_id to ObjectId
      const merchObjectId = new mongoose.Types.ObjectId(merch_id);

      // Check if the merch_id already exists in the cart
      if (student.cart.includes(merchObjectId)) {
        console.log("Merch already in cart");
        return res.status(400).json({ message: "Merch already in cart!" });
      }

      // Add to cart
      student.cart.push(merchObjectId);
      await student.save();

      console.log("Merch added to cart");
      return res.status(200).json({ message: "Merch added to cart" });
    } catch (error) {
      console.error("Error adding merch to cart:", error.message);
      return res
        .status(500)
        .json({ message: "Error adding merch to cart", error: error.message });
    }
  }
);

// GET cart list as Student
router.get("/cart/:student_id", authenticateToken, async (req, res) => {
  const student_id = req.params.student_id;

  try {
    const student = await Student.findById(student_id);

    if (!student) {
      console.error("Not logged in! User not found.");
      return res
        .status(404)
        .json({ message: "Not logged in! User not found." });
    }

    return res.status(200).json({ cart: student.cart });
  } catch (error) {
    console.error("Error viewing cart list!", error.message);
    return res
      .status(500)
      .json({ message: "Error viewing cart list!", error: error.message });
  }
});

// DELETE merch from cart as Student
router.delete(
  "/remove-from-cart/:student_id/:merch_id",
  authenticateToken,
  async (req, res) => {
    const { student_id, merch_id } = req.params;

    try {
      // Find the student by ID
      const student = await Student.findById(student_id);
      if (!student) {
        console.error("Not logged in! User not found.");
        return res
          .status(404)
          .json({ message: "Not logged in! User not found." });
      }

      // Convert merch_id to ObjectId
      const merchObjectId = new mongoose.Types.ObjectId(merch_id);

      // Find the index of the merch_id in the cart array
      const index = student.cart.indexOf(merchObjectId);
      if (index === -1) {
        console.error("Merch not found in cart.");
        return res.status(404).json({ message: "Merch not found in cart." });
      }

      // Remove the merch_id from the cart array
      student.cart.splice(index, 1);
      await student.save();

      console.log("Merch removed from cart.");
      return res.status(200).json({ message: "Merch removed from cart." });
    } catch (error) {
      console.error("Error removing merch from cart:", error.message);
      return res.status(500).json({
        message: "Error removing merch from cart",
        error: error.message,
      });
    }
  }
);

module.exports = router;
