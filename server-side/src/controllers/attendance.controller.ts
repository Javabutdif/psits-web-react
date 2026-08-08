import { Request, Response } from "express";
import { Event as EventModel } from "../models/event.model";
import { Attendance } from "../models/attendance.model";

export const applyEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { id_number, name, course, year, campus } = req.body;

    const event = await EventModel.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.eventDate && new Date(event.eventDate) < new Date()) {
      return res.status(400).json({ message: "Cannot apply to a past event" });
    }

    const alreadyApplied = event.attendees.some(
      (a) => a.id_number === id_number
    );
    if (alreadyApplied) {
      return res.status(409).json({ message: "Already applied to this event" });
    }

    const campusLimit = event.limit.find((l) => l.campus === campus);
    const campusCount = event.attendees.filter(
      (a) => a.campus === campus
    ).length;
    if (campusLimit && campusCount >= campusLimit.limit) {
      return res
        .status(400)
        .json({ message: `Slot limit reached for ${campus}` });
    }

    const emptySessions = {
      morning: { attended: false },
      afternoon: { attended: false },
      evening: { attended: false },
    };

    event.attendees.push({
      id_number,
      name,
      course,
      year,
      campus,
      attendance: emptySessions,
    } as any);
    await event.save();

    const newAttendeeSub = event.attendees[event.attendees.length - 1] as any;
    await Attendance.create({
      event: event._id,
      attendeeRef: newAttendeeSub._id,
      id_number,
      attendance: emptySessions,
    });

    return res.status(201).json({ message: "Applied successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to apply", error: (err as Error).message });
  }
};

export const scanAttendance = async (req: Request, res: Response) => {
  try {
    const { eventId, id_number, session } = req.body;

    const attendance = await Attendance.findOne({ event: eventId, id_number });
    if (!attendance) {
      return res.status(404).json({ message: "No application record found" });
    }

    if (
      attendance.attendance[session as "morning" | "afternoon" | "evening"]
        ?.attended
    ) {
      return res
        .status(409)
        .json({ message: `Already marked attended for ${session}` });
    }

    attendance.attendance[session as "morning" | "afternoon" | "evening"] = {
      attended: true,
      timestamp: new Date(),
    };
    await attendance.save();

    await EventModel.updateOne(
      { _id: eventId, "attendees.id_number": id_number },
      {
        $set: {
          [`attendees.$.attendance.${session}.attended`]: true,
          [`attendees.$.attendance.${session}.timestamp`]: new Date(),
        },
      }
    );

    return res
      .status(200)
      .json({ message: `Marked attended (${session})`, attendance });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Scan failed", error: (err as Error).message });
  }
};

export const markAttendedManually = async (req: Request, res: Response) => {
  try {
    const { eventId, id_number, session } = req.body;
    const adminName = (req as any).user?.name ?? "admin";

    const attendance = await Attendance.findOne({ event: eventId, id_number });
    if (!attendance)
      return res.status(404).json({ message: "Record not found" });

    attendance.attendance[session as "morning" | "afternoon" | "evening"] = {
      attended: true,
      timestamp: new Date(),
    };
    attendance.confirmedBy = adminName;
    await attendance.save();

    await EventModel.updateOne(
      { _id: eventId, "attendees.id_number": id_number },
      {
        $set: {
          [`attendees.$.attendance.${session}.attended`]: true,
          [`attendees.$.attendance.${session}.timestamp`]: new Date(),
          "attendees.$.confirmedBy": adminName,
        },
      }
    );

    return res.status(200).json(attendance);
  } catch (err) {
    return res
      .status(500)
      .json({
        message: "Failed to mark attended",
        error: (err as Error).message,
      });
  }
};

export const getEventAttendees = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { status } = req.query; // optional: "morning" | "afternoon" | "evening" filter

    const attendances = await Attendance.find({ event: eventId });

    return res.status(200).json(attendances);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to fetch attendees", error: (err as Error).message });
  }
};
