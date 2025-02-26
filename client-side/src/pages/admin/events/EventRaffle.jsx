import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { getRaflleAttendees } from "../../../api/event";
import RafflePicker from '../../../components/raffle/RafflePicker';
import Tabs from '../../../components/raffle/Tabs';

const EventRaffle = () => {
  const { eventId } = useParams(); // Get the eventId from the URL params
  const [selectedCampus, setSelectedCampus] = useState('UC-Main');
  const [participants, setParticipants] = useState([]); // State to store participants
  const [loading, setLoading] = useState(true); // State to track loading status

  const getAllAttendees = async () => {
    return await getRaflleAttendees(eventId); // This should fetch attendees for the event
  };

  const fetchData = async () => {
    try {
      setLoading(true); // Set loading to true before fetching
      const result = await getAllAttendees(); // Fetch the attendees data
  
      console.log("Fetched data:", result); // Log the data for debugging
  
      if (result) {
        // Group participants by campus
        const campuses = {
          Main: [],
          Banilad: [],
          LM: [],
          Pardo: [],
          All: [],
        };
  
        // Sort participants by campus and add them to the "All" campus as well
        result.forEach((participant) => {
          // Assuming each participant has a campus property
          const campus = participant.campus || 'UC-Main'; // Default to 'Main' if no campus
          if (campuses[campus]) {
            campuses[campus].push(participant);
          } else {
            campuses[campus] = [participant]; // In case a new campus is added
          }
  
          // Also add participant to the "All" campus
          campuses['All'].push(participant);
        });
  
        // Sort participants within each campus by name
        Object.keys(campuses).forEach((campus) => {
          campuses[campus].sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name
        });
  
        setParticipants(campuses); // Set the sorted campus data
      } else {
        console.error("No attendees found");
      }
      setLoading(false); // Set loading to false after fetching is complete
    } catch (error) {
      console.error("Error fetching data:", error); // Handle error
      setLoading(false); // Set loading to false even on error
    }
  };

  useEffect(() => {
    fetchData(); // Fetch attendees when the component mounts or when eventId changes
  }, [eventId]);


  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-4">
      {/* Raffle and Extra Content */}
      <div className="flex flex-col md:flex-row justify-center gap-4 w-full">
        {/* Raffle Picker */}
        <div className="w-full md:w-1/2 p-4 flex flex-col min-h-[70vh] justify-center items-center">
          {/* Pass sorted participants for selected campus */}
          <RafflePicker participants={participants[selectedCampus]?.map((participant) => participant.name) || []} />
        </div>

        {/* Extra Content */}
        <div className="w-full md:w-1/3 p-4 flex flex-col bg-white rounded-md shadow-lg justify-center items-center">
          <div className="bg-white w-full md:w-full h-40 md:h-full">
            {/* Additional Content */}
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="w-full md:w-1/3 flex justify-center mt-6">
        <Tabs onSelectCampus={setSelectedCampus} />
      </div>
    </div>
  );
};

export default EventRaffle;