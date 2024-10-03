const Log = require("../models/Log");

const logActivity = async (
  action,
  user,
  userId,
  entity,
  entityId,
  entityDetails,
  operationDetails,
  ipAddress,
  changes,
  additionalInfo
) => {
  try {
    const newLog = new Log({
      action,
      user,
      userId,
      entity,
      entityId,
      entityDetails,
      operationDetails,
      ipAddress,
      changes,
      additionalInfo,
    });
    await newLog.save();
    console.log("Activity logged:", action);
  } catch (err) {
    console.error("Error logging activity:", err);
  }
};

module.exports = logActivity;
