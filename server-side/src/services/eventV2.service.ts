import mongoose from "mongoose";
import { Event } from "../models/event.model";
import { hydrateAttendeesAttendance } from "./attendance.service";
import { campus_type } from "../enums/campus.enums";

export class EventV2Service {
  /**
   * Fetch all raw events with certificate and key details.
   */
  static async getAllEventsRaw() {
    return await Event.find(
      {},
      "eventId eventName eventImage eventDate eventDescription isGenerateCertificate eligibleStudentsForCertificate eventVenue eventTheme eventVenueSpecific eventStartTime eventEndTime -_id"
    ).lean();
  }

  /**
   * Update details of an existing event.
   */
  static async updateEvent(eventId: string, updateFields: any) {
    const updatedEvent = await Event.findOneAndUpdate(
      { eventId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    return updatedEvent;
  }

  /**
   * Business logic for getting event attendees.
   */
  static async getEventAttendees(eventId: string) {
    const query = mongoose.isValidObjectId(eventId)
      ? {
          $or: [
            { _id: new mongoose.Types.ObjectId(eventId) },
            { eventId: eventId },
          ],
        }
      : { eventId: eventId };
    const event = await Event.findOne(query).select("_id attendees eventId").lean();

    if (!event) {
      throw new Error("Event not found");
    }

    const attendeeList = Array.isArray(event.attendees)
      ? event.attendees
      : [];

    const hydratedAttendees = await hydrateAttendeesAttendance(
      event._id,
      attendeeList as any
    );

    return hydratedAttendees;
  }
}
