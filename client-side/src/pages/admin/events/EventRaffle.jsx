import React, { useState } from 'react'
import Tabs from '../../../components/raffle/Tabs'
import RafflePicker from '../../../components/raffle/RafflePicker'

// Dummy data for each campus
const participantsData = {
  Main: ['Jan Lorenz Laroco', 'Anton James Genabio', 'Jacinth Cedric Barral', 'lance timotuy', 'dsadsad vcd ', 'fdsfds vdfs vd'],
  Banilad: ['David', 'Eve', 'Frank'],
  LM: ['Grace', 'Heidi', 'Ivan'],
  Pardo: ['Judy', 'Karl', 'Leo'],
  All: ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy', 'Karl', 'Leo', 'Jan Lorenz Laroco', 'Anton James Genabio', 'Jacinth Cedric Barral', 'lance timotuy', 'dsadsad vcd ', 'fdsfds vdfs vd'],
};

const EventRaffle = () => {
  const [selectedCampus, setSelectedCampus] = useState('Main');

  return (
    // <div className='flex flex-col justify-center items-center'>
    //   <div className='w-full p-4 flex flex-col bg-black min-h-screen-half items-center'>
    //   <RafflePicker participants={participantsData[selectedCampus]} />

    //   </div>
    //   <Tabs onSelectCampus={setSelectedCampus} />

    // </div>




<div className="flex flex-col justify-center items-center min-h-screen p-4">
  {/* Raffle and Extra Content */}
  <div className="flex flex-col md:flex-row justify-center gap-4 w-full">
    {/* Raffle Picker */}
    <div className="w-full md:w-1/2 p-4 flex flex-col min-h-[70vh] justify-center items-center">
      <RafflePicker participants={participantsData[selectedCampus]} />
    </div>

    {/* Extra Content */}
    <div className="w-full md:w-1/3 p-4 flex flex-col bg-white rounded-md shadow-lg justify-center items-center">
      <div className="bg-white w-full md:w-full h-40 md:h-full">
        {/* <h1>{displayedParticipant}</h1> */}

      </div>
    </div>
  </div>

  {/* Tabs Section */}
  <div className="w-full md:w-1/3 flex justify-center mt-6">
    <Tabs onSelectCampus={setSelectedCampus} />
  </div>
</div>

  ) 
}

export default EventRaffle
