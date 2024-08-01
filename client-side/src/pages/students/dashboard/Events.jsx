import React from 'react';
import EventList from './EventList';

const Events = ({ events }) => {
  // Group events by date
  const groupedEvents = Object.values(events).reduce((acc, event) => {
    if (!acc[event.date]) {
      acc[event.date] = [];
    }
    acc[event.date].push(event);
    return acc;
  }, {});
  
  // Get limited dates to display (2 or 3 dates)
  const limitedDates = Object.keys(groupedEvents).slice(0, 3); // Change to 2 for two dates

  return (
    <div className="self-start md:flex-none space-y-2 sm:space-y-6 p-4 bg-white rounded-xs">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-4">Upcoming Events</h2>
      {limitedDates.map((date) => (
        <div key={date} className="hidden lg:block bg-gray-50 p-4 rounded-lg shadow-sm mb-4">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">{date}</h3>
          {groupedEvents[date].map((item) => (
            <EventList key={item.id} item={item} />
          ))}
        </div>
      ))}
      <button
        className="w-full text-sm mt-0 md:mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 shadow-md"
      >
        View all
      </button>
    </div>
  );
};

export default Events;
