const mongoose = require("mongoose");
const Attendee = require("./AttendeesModel");
const Merch = require("./MerchModel");

const Schema = mongoose.Schema;

const eventSchema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: "Merch",
    required: true,
  },
  eventName: {
    type: String,
    unique: true,
    required: true,
  },
  eventImage: {
    type: String,
  },
  eventDate: {
    type: Date,
    required: true,
  },
  attendees: [Attendee],
  status: {
    type: String,
    required: true,
  },
});

const Event = mongoose.model("event", eventSchema);

module.exports = Event;
