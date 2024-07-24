const express = require("express");
const Merch = require("../models/MerchModel");
const Student = require("../models/StudentModel");
const { default: mongoose } = require("mongoose");

const router = express.Router();

//TODO: Make some methods only exclusive to admin accounts

// CREATE a new merch
router.post("/", async (req, res) => {
  const {
    name,
    price,
    stocks,
    batch, //unrequired
    description,
    variation, //unrequired
    size, //unrequired
    created_by,
    start_date,
    end_date, //unrequired
    category,
    image_url,
    sales_data,
  } = req.body;

  try {
    const newMerch = new Merch({
      name,
      price,
      stocks,
      batch, //unrequired
      description,
      variation, //unrequired
      size, //unrequired
      created_by,
      start_date,
      end_date, //unrequired
      category,
      image_url,
      sales_data,
    });

    await newMerch.save();

    res.status(201).json("Merch Addition Successful");
  } catch (error) {
    console.error("Error saving new merch:", error.message);
    res.status(500).send(error.message);
  }
});

// GET list of merches
router.get("/retrieve", async (req, res) => {
  try {
    const merches = await Merch.find();
    res.status(200).json(merches);
  } catch (error) {
    console.error("Error fetching merches:", error.message);
    res.status(500).send(error.message);
  }
});

router.get("/:searchQuery", async (req, res) => {
  const search = req.params.searchQuery;

  try {
    const merch = await Merch.find({ name: new RegExp(search, "i") });

    if (!merch || merch.length === 0) {
      return res.status(404).json({ message: "Merch not found!" });
    }

    res.status(200).json(merch);
  } catch (error) {
    console.error("Error fetching merch:", error.message);
    res.status(500).send(error.message);
  }
});

// UPDATE merch by id
router.put("/:_id", async (req, res) => {
  const {
    name,
    price,
    stocks,
    batch, //unrequired
    description,
    variation, //unrequired
    size, //unrequired
    start_date,
    end_date, //unrequired
    category,
    image_url,
    sales_data,
  } = req.body;

  const id = req.params._id;

  try {
    // Create an update object
    const updateFields = {
      name: name,
      price: price,
      stocks: stocks,
      batch: batch, //unrequired
      description: description,
      variation: variation, //unrequired
      size: size, //unrequired
      start_date: start_date,
      end_date: end_date, //unrequired
      category: category,
      image_url: image_url,
    };

    // Add sales_data fields to the update object
    // This is added to not update the entire object and generate a new key in mongodb
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

    res.status(200).send("Merch updated successfully");
  } catch (error) {
    console.error("Error updating merch:", error.message);
    res.status(500).send(error.message);
  }
});

// DELETE merch by id (soft)
router.delete("/:_id", async (req, res) => {
  const id = req.params._id;

  try {
    const result = await Merch.updateOne(
      { _id: id },
      {
        $set: {
          is_active: false,
        },
      }
    );

    if (result.matchedCount === 0) {
      console.error("Merch not found");
      return res.status(404).send("Merch not found");
    }

    res.status(200).send("Merch deleted successfully");
  } catch (error) {
    console.error("Error deleting merch:", error.message);
    res.status(500).send(error.message);
  }
});

// ADD merch to cart as Student
router.put("/add-to-cart/:student_id/:merch_id", async (req, res) => {
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
});

// GET cart list as Student
router.get("/cart/:student_id", async (req, res) => {
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
router.delete("/remove-from-cart/:student_id/:merch_id", async (req, res) => {
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
});

module.exports = router;
