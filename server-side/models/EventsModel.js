const mongoose = require("mongoose");
const Attendee = require("./AttendeesModel");

const Schema = mongoose.Schema;

const eventSchema = new Schema({
  eventName: {
    type: String,
    unique: true,
  },
  eventDate: {
    type: Date,
  },
  attendees: [Attendee.Schema],

  status: {
    type: String,
  },
});

const Event = mongoose.model("event", eventSchema);

module.exports = Event;
