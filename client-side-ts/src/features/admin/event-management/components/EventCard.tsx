import React from "react";
import { MoreVertical, BarChart3, Ticket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Event as ApiEvent } from "@/features/events/types/event.types";

const getEventId = (event: ApiEvent): string =>
  String(event.eventId ?? event._id ?? "unknown-id");

const getEventTitle = (event: ApiEvent): string =>
  String(event.eventName ?? "Untitled Event");

const getEventDate = (event: ApiEvent): string => {
  if (!event.eventDate) return "TBA";

  const date = new Date(event.eventDate);

  // Fallback to original string if the date is invalid
  if (isNaN(date.getTime())) return String(event.eventDate);

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC", // Prevents day-shifting depending on the user's local timezone
  }).format(date);
};

const getEventImage = (event: ApiEvent): string => {
  const firstImage = Array.isArray(event.eventImage)
    ? event.eventImage[0]
    : undefined;

  return firstImage ? String(firstImage) : "/default-placeholder.png";
};

interface EventCardProps {
  event: ApiEvent;
  onManageEvent?: (eventId: string) => void;
  onViewStatistics?: (eventId: string) => void;
  onViewRaffle?: (eventId: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onManageEvent,
  onViewStatistics,
  onViewRaffle,
}) => {
  const eventId = getEventId(event);
  const eventTitle = getEventTitle(event);
  const eventDate = getEventDate(event);
  const eventImage = getEventImage(event);

  const handleMainAction = () => {
    // Always open the event management page when the main button is clicked
    onManageEvent?.(eventId);
  };

  return (
    <Card className="overflow-hidden border-gray-200 transition-shadow hover:shadow-lg">
      <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-white p-6">
        <img
          src={eventImage}
          alt={eventTitle}
          className="h-full w-full rounded-lg object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Cg transform='translate(200,150)'%3E%3Crect x='-40' y='-32' width='80' height='64' rx='6' fill='%23cbd5e1'/%3E%3Ccircle cx='0' cy='-6' r='14' fill='%23f1f5f9'/%3E%3Cellipse cx='0' cy='26' rx='22' ry='14' fill='%23f1f5f9'/%3E%3C/g%3E%3C/svg%3E`;
          }}
        />
      </div>
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="mb-1 truncate text-base font-semibold sm:text-lg">
              {eventTitle}
            </h3>
            <p className="text-muted-foreground text-sm">{eventDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleMainAction}
            className="flex-1 cursor-pointer rounded-2xl bg-[#1C9DDE] hover:bg-[#1C9DDE]"
          >
            Manage Event
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onViewStatistics?.(eventId)}
              >
                <BarChart3 />
                <span>Statistics</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onViewRaffle?.(eventId)}
              >
                <Ticket />
                <span>Raffle</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
