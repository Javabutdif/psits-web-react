const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 5000;
const Student = require("./models/StudentModel");
const mongodbConnection = require("./mongoDB/MongoDbConnection");
const bcrypt = require("bcrypt");
const registerRoutes = require("./routes/register");

//Middleware
app.use(bodyParser.json());
app.use(cors());

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
app.use("/api", registerRoute);

app.listen(PORT, () => {
  console.log(`Server started, listening at port ${PORT}`);
});
