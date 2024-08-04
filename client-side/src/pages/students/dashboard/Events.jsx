import React from 'react';
import { motion } from 'framer-motion'; // Import motion from Framer Motion
import EventList from './EventList';

const Events = ({ events, styles }) => {
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
    <div className={`${styles} p-2 sm:p-3 bg-gradient-to-br from-white to-gray-100 rounded-md shadow-sm`}>
      <h2 className="text-base sm:text-lg font-extrabold text-gray-800 mb-2 sm:mb-3">Upcoming Events</h2>
      {limitedDates.length ? (
        limitedDates.map((date) => (
          <div key={date} className="hidden lg:block mb-2 border-b border-gray-200 pb-2 last:border-0">
            <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-1">{date}</h3>
            {groupedEvents[date].map((item) => (
              <EventList key={item.id} item={item} />
            ))}
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-xs">No events scheduled.</p>
      )}
      <motion.button
        className="w-full mt-3 px-2 py-1 bg-custom-text rounded-md transition duration-200 text-xs"
        whileHover={{ scale: 1.05 }} // Scale up on hover
        whileTap={{ scale: 0.95 }} // Scale down on tap/click
        whileFocus={{ scale: 1.05 }} // Scale up on focus
      >
        View All
      </motion.button>
    </div>
  );
};

export default Events;
