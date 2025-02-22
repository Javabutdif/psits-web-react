const mongoose = require("mongoose");
const attendeeSchema = require("./AttendeesModel");
const raffleSchema = require("./RaffleModel");

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
  raffle: {
    type: [raffleSchema],
    default: [],
  },
  status: {
    type: String,
    required: true,
  },
  limit: {
    type: [
      {
        campus: {
          type: String,
          enum: ["UC-Main", "UC-Banilad", "UC-LM", "UC-PT"],
          required: true,
        },
        limit: {
          type: Number,
          required: true,
        },
      },
    ],
    default: [
      { campus: "UC-Main", limit: 0 },
      { campus: "UC-Banilad", limit: 0 },
      { campus: "UC-LM", limit: 0 },
      { campus: "UC-PT", limit: 0 },
    ],
  },
});

const Event = mongoose.model("event", eventSchema);

module.exports = Event;
