import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  EventsHeader,
  ViewToggle,
  EventsGrid,
  EventsGridSkeleton,
  AddEventModal,
} from "@/features/admin/event-management";

import { getEvents } from "@/features/events/api/eventService";

// Alias the API Event type
import type { Event as ApiEvent } from "@/features/events/types/event.types";

const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<ApiEvent[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      const data = await getEvents();
      setEvents(Array.isArray(data) ? data : []);

      setIsLoading(false);
    };

    fetchEvents();
  }, []);

  // Event handlers
  // const handleAddEvent = () => {
  //   setIsAddEventModalOpen(true);
  // };

  const handleManageEvent = (eventId: string) => {
    const getEventId = (event: ApiEvent): string =>
      String(event.eventId ?? event._id ?? "unknown-id");
    const event = events.find((e) => getEventId(e) === eventId);
    if (event) {
      navigate(`/admin/events/${eventId}`, { state: { event } });
    }
  };

  const handleViewStatistics = (eventId: string) => {
    navigate(`/admin/events/${eventId}/statistics`);
  };

  const handleViewRaffle = (eventId: string) => {
    navigate(`/admin/events/${eventId}/raffle`);
  };

  return (
    <div className="flex flex-1 flex-col">
      <EventsHeader />

      <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />

      {isLoading ? (
        <EventsGridSkeleton viewMode={viewMode} />
      ) : (
        <EventsGrid
          events={events}
          viewMode={viewMode}
          onManageEvent={handleManageEvent}
          // onUpdateEvent={handleUpdateEvent}
          // onDeleteEvent={handleDeleteEvent}
          onViewStatistics={handleViewStatistics}
          onViewRaffle={handleViewRaffle}
        />
      )}

      <AddEventModal
        open={isAddEventModalOpen}
        onOpenChange={setIsAddEventModalOpen}
        onAddEvent={() => {}}
      />
    </div>
  );
};

export default EventsPage;
