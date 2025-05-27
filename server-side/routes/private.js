const express = require("express");
const { admin_model, user_model } = require("../model_template/model_data");
const {
  admin_authenticate,
  student_authenticate,
} = require("../middlewares/custom_authenticate_token");
const router = express.Router();

//protected route for admin
router.get("/protected-route-admin", admin_authenticate, async (req, res) => {
  try {
    if (req.user.role === "Admin") {
      return res.status(200).json({
        user: req.user,
        role: req.user.role,
      });
    } else return res.status(400).json({ message: "Access Denied" });
  } catch (error) {
    console.error(error);
  }
});
//Student route
router.get(
  "/protected-route-student",
  student_authenticate,
  async (req, res) => {
    try {
      if (req.user.role === "Student") {
        return res.status(200).json({
          user: req.user,
          role: req.user.role,
        });
      } else return res.status(400).json({ message: "Access Denied" });
    } catch (error) {
      console.error(error);
    }
  }
);

module.exports = router;
