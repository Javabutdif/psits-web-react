const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const logSchema = new Schema({
  id_number: {
    type: String,
    required: true,
    unique: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  admin: {
    type: String,
    required: true,
  },
  admin_id: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  target: {
    type: String,
    required: false, // Optional: any identifier for the affected entity
  },
  target_id: {
    type: Schema.Types.ObjectId, // Reference to multiple collections (polymorphic reference)
    required: false,
  },
  target_model: {
    type: String,
    required: false, // Specifies the collection name for the `target_id` reference
    enum: ["Admin", "Student", "Merchandise", "Order"], // Allowed models
  },
});

const Log = mongoose.model("Log", logSchema);

module.exports = Log;
