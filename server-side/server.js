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
const merchRoutes = require("./routes/merch");
const orderRoutes = require("./routes/orders");
const cartRoutes = require("./routes/cart");

require("dotenv").config();

app.use(cors());
app.use(bodyParser.json());

//Connection to Mongoose
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: "psits",
  })
  .then(() => console.log("MongoDB PSITS connected"))
  .catch((err) => console.log(err));

//Routes
app.use("/api", registerRoutes);
app.use("/api", loginRoutes);
app.use("/api", studentApproveRoutes);
app.use("/api", adminRoutes);
app.use("/api/merch", merchRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);

app.listen(PORT, () => {
  console.log(`Server started, listening at port ${PORT}`);
});
