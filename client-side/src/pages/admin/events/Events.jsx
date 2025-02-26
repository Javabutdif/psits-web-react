import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { getEvents } from "../../../api/event";
import { MdOutlineQueryStats, MdOutlineCardGiftcard } from "react-icons/md"; // Add the new icon import
import Attendance from "../Attendance/Attendance";

function Events() {
  const [events, setEvent] = useState([]);

  const handleGetEvents = async () => {
    const response = await getEvents();
    setEvent(response.data);
  };

  useEffect(() => {
    handleGetEvents();
  }, []);

  return (
    <div className="mt-5 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2x1:grid-cols-6  ">
      {events.map((event) => (
        <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 ">
          <div className="relative w-full h-48 mb-3">
            <img
              src={event.eventImage[0]}
              alt={event.eventName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className=" pr-4 pl-4 pb-4">
            <h1 className="ml-3 text-lg font-semibold text-gray-800 truncate mb-2">
              {event.eventName}
            </h1>
            <p className="mb-3 ml-3 text-[074873]">Coming Soon...</p>
            <div className="flex gap-1 items-center justify-center">
              <Link
                to={`/admin/attendance/${event.eventId}`}
                className="w-[80%] h-full"
              >
                <button
                  className="w-full h-full bg-[#002E48] hover:bg-[#013e61] text-white text-sm font-medium py-2 px-4 rounded-md cursor-pointer hover:scale-105 transition-transform duration-200"
                  tabIndex="0"
                >
                  View
                </button>
              </Link>

              <Link to={`/admin/statistics/${event.eventId}`} className="h-full">
                <button
                  className="w-full h-full border border-[#002E48] bg-white hover:bg-[#013e61] hover:text-white text-[#002E48] text-sm font-medium py-2 px-4 rounded-md cursor-pointer hover:scale-105 transition-transform duration-200"
                  tabIndex="1"
                >
                  <MdOutlineQueryStats />
                </button>
              </Link>

              <Link to={`/admin/raffle/${event.eventId}`} className="h-full">
                <button
                  className="w-full h-full border border-[#002E48] bg-white hover:bg-[#013e61] hover:text-white text-[#002E48] text-sm font-medium py-2 px-4 rounded-md cursor-pointer transition-colors duration-200 hover:scale-105 transition-transform duration-200"
                  tabIndex="2"
                >
                  <MdOutlineCardGiftcard />
                </button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Events;
