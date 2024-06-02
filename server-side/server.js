const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

app.get("/api/data", (req, res) => {
  // Logic to fetch data from the database or elsewhere
  const data = { message: "Hello from Express.js backend!" };

  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server started, listening at port ${PORT}`);
});
