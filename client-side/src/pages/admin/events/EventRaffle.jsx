import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getEligibleRaffleAttendees,
  raffleWinner,
  removeRaffleAttendee,
} from "../../../api/event";
import RafflePicker from "../../../components/raffle/RafflePicker";
import Tabs from "../../../components/raffle/Tabs";

const EventRaffle = () => {
  const { eventId } = useParams();
  const [selectedCampus, setSelectedCampus] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  const [participants, setParticipants] = useState([]); // all participants
  const [currentParticipants, setCurrentParticipants] = useState([]); // participants based on selectedCampus
  const [winners, setWinners] = useState([]); // all winners
  const [currentWinners, setCurrentWinners] = useState([]); // winners based on selectedCampus

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const result = await getEligibleRaffleAttendees(eventId);

      if (result) {
        setParticipants(result.attendees);
        setWinners(result.winners);
      } else {
        console.error("No attendees found");
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  const filterCurrentParticipants = () => {
    if (selectedCampus === "All") {
      setCurrentParticipants(participants);
    } else {
      const filtered = participants.filter(
        (participant) => participant.campus === selectedCampus
      );
      setCurrentParticipants(filtered);
    }
  };

  const filterCurrentWinners = () => {
    if (selectedCampus === "All") {
      setCurrentWinners(winners);
    } else {
      const filtered = winners.filter(
        (winner) => winner.campus === selectedCampus
      );
      setCurrentWinners(filtered);
    }
  };

  const handleRaffleWinner = async (attendeeId) => {
    try {
      const result = await raffleWinner(eventId, attendeeId);
      if (result) {
        const winner = currentParticipants.find(
          (p) => p.id_number === attendeeId
        );
        setParticipants((prev) =>
          prev.filter((p) => p.id_number !== attendeeId)
        );
        setWinners((prev) => [...prev, winner]);
      }
    } catch (error) {
      console.error("Error marking attendee as raffle winner:", error);
    }
  };

  const handleRemoveAttendee = async (attendeeId) => {
    try {
      const result = await removeRaffleAttendee(eventId, attendeeId);
      if (result) {
        setParticipants((prev) =>
          prev.filter((p) => p.id_number !== attendeeId)
        );
      }
    } catch (error) {
      console.error("Error removing attendee:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterCurrentParticipants();
  }, [selectedCampus, participants]);

  useEffect(() => {
    filterCurrentWinners();
  }, [selectedCampus, winners]);

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      {/* Raffle and Extra Content */}
      <div className="flex flex-col sm:flex-col md:flex-row justify-center md:justify-around gap-6 w-full">
        {/* Raffle Picker */}
        <div className="w-full md:w-1/2 p-4 flex flex-col min-h-[60vh] md:min-h-[70vh] justify-center items-center">
          <RafflePicker
            participants={currentParticipants}
            onPickWinner={handleRaffleWinner}
            onRemoveAttendee={handleRemoveAttendee}
          />
        </div>

        {/* Winners Content */}
        <div className="w-full sm:w-1/2 md:w-1/3 p-4 flex flex-col rounded-md shadow-lg justify-center items-center">
          <div className="w-full h-40 md:h-auto rounded-md flex flex-col gap-1 items-center justify-center overflow-y-auto max-h-64">
            {currentWinners.map((winner, index) => (
              <div key={index} className="text-center p-2 bg-white w-full">
                {winner.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="w-full md:w-1/3 flex justify-center mt-8">
        <Tabs
          selectedCampus={selectedCampus}
          setSelectedCampus={setSelectedCampus}
        />
      </div>
    </div>
  );
};

export default EventRaffle;
