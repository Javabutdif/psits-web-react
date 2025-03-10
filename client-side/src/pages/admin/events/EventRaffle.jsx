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
        (participant) =>
          (selectedCampus === "UC-Main" &&
            (participant.campus === "UC-Main" ||
              participant.campus === "UC-CS")) ||
          participant.campus === selectedCampus
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
    <div className="flex flex-col items-center min-h-screen ">
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
        <div className="w-full bg-[#074873] h-[70vh] sm:w-full md:w-1/3 p-4 flex flex-col rounded-md shadow-lg mt-5 items-center">
          <div>
            <h1 className="text-[#FFD700] text-2xl mb-5 text-center">
              RAFFLE WINNERS
            </h1>
          </div>
          <div className="w-full md:h-auto rounded-md flex flex-col items-center justify-center overflow-y-scroll max-h-[60vh]">
            {currentWinners.map((winner, index) => (
              <div
                key={index}
                className="text-center text-white p-2 font-bold w-full rounded-md text-sm sm:text-sm md:text-md lg:text-lg"
              >
                {winner.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="w-full  md:w-1/3 flex justify-center mt-8">
        <Tabs
          selectedCampus={selectedCampus}
          setSelectedCampus={setSelectedCampus}
        />
      </div>
    </div>
  );
};

export default EventRaffle;
