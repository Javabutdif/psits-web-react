const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 5000;
const Student = require("./models/StudentModel");
const mongodbConnection = require("./mongoDB/MongoDbConnection");
const bcrypt = require("bcryptjs");
const registerRoutes = require("./routes/register");
const loginRoutes = require("./routes/login");

//Middleware
app.use(cors());
app.use(bodyParser.json());

//Connection to Mongoose
mongoose
  .connect(mongodbConnection(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "psits",
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

//Routes
app.use("/api", registerRoutes);
app.use("/api", loginRoutes);

app.listen(PORT, () => {
  console.log(`Server started, listening at port ${PORT}`);
});
