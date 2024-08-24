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
    <div className={`${styles} p-4 sm:p-5 bg-gradient-to-br from-white to-gray-100 rounded-md shadow-sm`}>
      <h2 className="text-lg sm:text-xl font-extrabold text-gray-800 mb-3">Upcoming Events</h2>
      {limitedDates.length ? (
        limitedDates.map((date) => (
          <section key={date} className="hidden mb-4 border-b border-gray-200 last:border-0">
            <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-2">{date}</h3>
            {groupedEvents[date].map((item) => (
              <EventList key={item.id} item={item} />
            ))}
          </section>
        ))
      ) : (
        <p className="text-gray-500 text-sm">No events scheduled.</p>
      )}
      <motion.button
        className="w-full mt-4 px-3 py-2 bg-custom-text rounded-md transition duration-200 text-sm bg-primary text-white"
        whileHover={{ scale: 1.05 }} // Scale up on hover
        whileTap={{ scale: 0.95 }} // Scale down on tap/click
        whileFocus={{ scale: 1.05 }} // Scale up on focus
        aria-label="View all events"
      >
        View All
      </motion.button>
    </div>
  );
};

export default Events;
