import React, { useState } from 'react'
import Tabs from '../../../components/raffle/Tabs'
import RafflePicker from '../../../components/raffle/RafflePicker'

// Dummy data for each campus
const participantsData = {
  Main: ['Alice', 'Bob', 'Charlie', 'Alice', 'Bob', 'Charlie', 'Alice', 'Bob', 'Charlie', 'Alice', 'Bob', 'Charlie','Alice', 'Bob', 'Charlie'],
  Banilad: ['David', 'Eve', 'Frank'],
  LLM: ['Grace', 'Heidi', 'Ivan'],
  Pardo: ['Judy', 'Karl', 'Leo'],
  All: ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy', 'Karl', 'Leo']
};

const EventRaffle = () => {
  const [selectedCampus, setSelectedCampus] = useState('All');

  return (
    <div className='flex items-center justify-center gap-2'>
      <div className='w-1/2 bg-black p-2 flex flex-col justify-center items-center'>
      <div></div>
      <div></div>
      <RafflePicker participants={participantsData[selectedCampus]} />
      <Tabs onSelectCampus={setSelectedCampus} />
      </div>
      <div className='w-1/2 bg-black p-2 flex flex-col justify-center items-center'>
     
      </div>
      {/* <div className='bg-white p-2 flex flex-col justify-center items-center' >
      <div className="w-72 h-72 rounded-full flex items-center justify-center bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500 shadow-xl border-4 border-white animate-pulse">
        <span className="text-3xl font-bold text-white drop-shadow-lg">🎉 Raffle 🎉</span>
      </div>

      </div> */}
     
    </div>
    
  ) 
}

export default EventRaffle
