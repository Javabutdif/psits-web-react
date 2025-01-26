const mongoose = require("mongoose");
const attendeeSchema = require("./AttendeesModel");

const Schema = mongoose.Schema;

const eventSchema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: "Merch",
    required: true,
  },
  eventName: {
    type: String,
    required: true,
  },
  eventImage: {
    type: Array,
  },
  eventDate: {
    type: Date,
    required: true,
  },
  eventDescription: {
    type: String,
    required: true,
  },
  attendees: {
    type: [attendeeSchema],
    default: [],
  },

  status: {
    type: String,
    required: true,
  },
});

const Event = mongoose.model("event", eventSchema);

module.exports = Event;
