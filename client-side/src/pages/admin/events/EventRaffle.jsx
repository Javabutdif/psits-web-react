import React, { useState } from 'react'
import Tabs from '../../../components/raffle/Tabs'
import RafflePicker from '../../../components/raffle/RafflePicker'

// Dummy data for each campus
const participantsData = {
  Main: ['Alice', 'Bob', 'Charlie'],
  Banilad: ['David', 'Eve', 'Frank'],
  LLM: ['Grace', 'Heidi', 'Ivan'],
  Pardo: ['Judy', 'Karl', 'Leo'],
  All: ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy', 'Karl', 'Leo']
};

const EventRaffle = () => {
  const [selectedCampus, setSelectedCampus] = useState('All');

  return (
    <div className='p-4 flex flex-col bg-black min-h-screen-half justify-center items-center'>
      <RafflePicker participants={participantsData[selectedCampus]} />
      <Tabs onSelectCampus={setSelectedCampus} />
    </div>
  ) 
}

export default EventRaffle
