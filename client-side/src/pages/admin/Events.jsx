import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { getEvents } from "../../api/event";

function Events() {

  const [events, setEvent] = useState([]);

  const handleGetEvents = async () => {
    const response = await getEvents();
    console.log(response.data);
    setEvent(response.data);
  };

  useEffect(() => {
    handleGetEvents();
  }, []);

  return (
    <div className="mt-5 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2x1:grid-cols-6  ">
      {events.map((event) => (
        <div className="border border-gray-300 rounded-lg overflow-hidden shadow-md hover:-translate-y-2 transition-transform duration-200">
          <img

            src={event.eventImage[0]}
            alt={event.eventName}
            className="object-cover mb-4 p-0 rounded-md w-full h-[300px]"
          />
          <div className="pr-4 pl-4 pb-4">
            <h1 className="text-lg font-semibold text-gray-800 truncate mb-2">
              {event.eventName}
            </h1>


            <Link to="/admin/attendance">
              <button
                className="w-full bg-[#002E48] hover:bg-[#013e61] text-white text-sm font-medium py-2 px-4 rounded-md cursor-pointer transition-colors duration-200 hover:scale-105 transition-transform duration-200"
                tabIndex="0"
              >
                View
              </button>
            </Link>
            
            <Link to="/admin/Statistics">
              <button
                className="w-full bg-[#002E48] hover:bg-[#013e61] text-white text-sm font-medium py-2 px-4 rounded-md cursor-pointer transition-colors duration-200 hover:scale-105 transition-transform duration-200"
                tabIndex="0"
              >
                View Statistics
              </button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Events;
