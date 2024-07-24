import React from 'react'
import EventList from './EventList';

const Events = ({ events }) => {
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
    <div className="flex-1 md:flex-none space-y-3 sm:space-y-4">
       <h2 className="text-lg font-bold">Upcoming Events</h2>
        {limitedDates.map((date) => (
          <div key={date} className="hidden block">
            <h3 className="text-lg font-semibold mb-2">{date}</h3>
            {groupedEvents[date].map((item) => (
              <EventList key={item.id} item={item} />
            ))}
          </div>
        ))}
        <button
          className="text-sm mt-4 px-4 py-2 bg-blue-500 w-full text-white rounded-lg hover:bg-blue-600 transition duration-300"
        >
          View all
        </button>

    </div>
  )
}

export default Events
