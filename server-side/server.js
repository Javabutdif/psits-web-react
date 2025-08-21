const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const helmet = require("helmet");
const PORT = process.env.PORT || 5000;
const indexRoutes = require("./routes/index");
const adminRoutes = require("./routes/admin");
const studentRoutes = require("./routes/students");
const merchRoutes = require("./routes/merch");
const orderRoutes = require("./routes/orders");
const cartRoutes = require("./routes/cart");
const logRoutes = require("./routes/logs");
const eventRoutes = require("./routes/events");
const privateRoutes = require("./routes/private");
require("dotenv").config();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.set("trust proxy", 1);
app.use(bodyParser.json());
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME,
  })
  .then(() => console.log("MongoDB PSITS connected"))
  .catch((err) => console.log(err));

//Routes
app.use("/api", indexRoutes);
app.use("/api", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/merch", merchRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/events", eventRoutes);
app.use("/api", privateRoutes);

app.listen(PORT, () => {
  console.log(`Server started, listening at port ${PORT}`);
});
