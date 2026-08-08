// ─── Types ────────────────────────────────────────────────────────────────────
export type {
  AttendeeData,
  Event,
  EventData,
  SessionConfig,
  SessionConfigEntry,
} from "./types/event.types";
// ─── API ──────────────────────────────────────────────────────────────────────
export { getEvents, getMyEvents, applyToEvent } from "./api/eventService";

// ─── Components ───────────────────────────────────────────────────────────────
export { QRCodeDisplay } from "./components/QRCodeDisplay";
export { EventCard } from "./components/EventCard";
