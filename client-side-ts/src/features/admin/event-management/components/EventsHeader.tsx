import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventsHeaderProps {
  onAddEvent?: () => void;
}

export const EventsHeader: React.FC<EventsHeaderProps> = ({ onAddEvent }) => {
  return (
    <header className="bg-background px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Events</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Create and manage upcoming events.
          </p>
        </div>
        <Button
          onClick={onAddEvent}
          disabled={!onAddEvent}
          size="default"
          className="w-full cursor-pointer bg-[#1C9DDE] hover:bg-[#1C9DDE] sm:w-auto disabled:cursor-not-allowed"
        >
          <Plus />
          <span>Add Event</span>
        </Button>
      </div>
    </header>
  );
};

export default EventsHeader;
