import mongoose from "mongoose";

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    id_number: String,
    password: String,
    first_name: String,
    middle_name: String,
    last_name: String,
    email: String,
    course: String,
    year: String,
  })
);
