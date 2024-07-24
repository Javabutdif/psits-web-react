import React from 'react'

const EventList = ({ item, index }) => {
  return (
    <div key={index} className="event-item">
    <h3>{item.name}</h3>
    <p>{item.date}</p>
    <p>{item.time}</p>
  </div>
  )
}

export default EventList
