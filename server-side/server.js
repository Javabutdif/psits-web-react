const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/api/data", (req, res) => {
  // Logic to fetch data from the database or elsewhere
  const data = { message: "Hello from Express.js backend!" };

  // Send the fetched data as a response
  res.json(data);
});
app.listen(PORT, () => {
  alert("Server started , listening at port ${PORT}");
});
