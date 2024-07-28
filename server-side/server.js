const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 5000;
const registerRoutes = require("./routes/register");
const loginRoutes = require("./routes/login");
const adminRoutes = require("./routes/admin");
const studentApproveRoutes = require("./routes/students");
const multer = require("multer");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");
const merchRoutes = require("./routes/merch");
const { S3Client } = require("@aws-sdk/client-s3");

require("dotenv").config();

//Middleware
app.use(cors());
app.use(bodyParser.json());

// Configure AWS SDK



//Connection to Mongoose
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: "psits",
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

//Routes
app.use("/api", registerRoutes);
app.use("/api", loginRoutes);
app.use("/api", studentApproveRoutes);
app.use("/api", adminRoutes);
app.use("/api/merch", merchRoutes);

app.listen(PORT, () => {
  console.log(`Server started, listening at port ${PORT}`);
});
