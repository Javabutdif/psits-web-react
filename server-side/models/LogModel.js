const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { LogActions } = require("../enums/logEnums.js");

const logSchema = new Schema({
  action: {
    type: String,
    required: true,
    enum: Object.values(LogActions), // Use enum values for validation
  }, // CREATE, UPDATE, DELETE, RENEW, APPROVE, etc.
  user: { type: String, required: true }, // Name of the admin performing the action
  userId: { type: String, required: true }, // ID of the admin performing the action
  entity: { type: String, required: true }, // Entity affected, e.g., "Student", "Membership"
  entityId: { type: String, required: true }, // ID of the affected entity (e.g., studentId)
  entityDetails: { type: Object, required: true }, // Store details like student name or membership type
  operationDetails: { type: String }, // Specifics like "renewed membership" or "approved membership"
  timestamp: { type: Date, default: Date.now }, // Timestamp for when the action occurred
  ipAddress: { type: String }, // Optional: IP address of the admin
  changes: { type: Object }, // Track changes made to an entity, e.g., { membership: "Pending" -> "Accepted" }
  additionalInfo: { type: Object }, // Optional field for any additional info
});

module.exports = mongoose.model("Log", logSchema);
