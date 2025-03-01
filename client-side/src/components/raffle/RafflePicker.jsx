import React, { useState, useRef, useEffect } from "react";
import { showToast } from "../../utils/alertHelper";

const RafflePicker = ({
  participants = [],
  onPickWinner,
  onRemoveAttendee,
}) => {
  const [isRaffling, setIsRaffling] = useState(false);
  const [winner, setWinner] = useState(null);
  const [displayedParticipants, setDisplayedParticipants] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const spinnerRef = useRef(null);

  const selectRandomWinner = (participantArray) => {
    if (!participantArray || participantArray.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * participantArray.length);
    return participantArray[randomIndex];
  };

  // Function to trigger confetti
  const triggerConfetti = () => {
    const confettiSettings = {
      particleCount: 150,
      spread: 180,
      origin: { y: 0.6 },
      colors: [
        "#FFD700",
        "#FFA500",
        "#ff0000",
        "#00ff00",
        "#0000ff",
        "#800080",
      ],
    };

    if (typeof window.confetti === "function") {
      // kanan
      window.confetti({
        ...confettiSettings,
        origin: { x: 0.2, y: 0.5 },
      });

      // kaliwa
      window.confetti({
        ...confettiSettings,
        origin: { x: 0.8, y: 0.5 },
      });

      // centerrr
      setTimeout(() => {
        window.confetti({
          ...confettiSettings,
          origin: { x: 0.5, y: 0.5 },
        });
      }, 500);
    }
  };

  // Starts raffle (animation and RNG)
  const startRaffle = () => {
    if (participants.length < 2) {
      showToast(
        "error",
        "You need at least 2 participants to start the raffle!"
      );
      return;
    }

    setWinner(null);
    setIsRaffling(true);
    setCountdown(5);
    setShowWinnerModal(false);

    // Start with showing random participants during countdown
    const shuffleInterval = setInterval(() => {
      // Show random participants from the list during animation
      const randomSelection = [];
      for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * participants.length);
        randomSelection.push(participants[randomIndex]);
      }
      setDisplayedParticipants(randomSelection);
    }, 150);

    // Handle countdown
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => {
      clearInterval(shuffleInterval);

      // Get the true random winner
      const selectedWinner = selectRandomWinner(participants);

      // Show final animation with the winner
      const finalDisplayed = [];
      for (let i = 0; i < 9; i++) {
        const randomIndex = Math.floor(Math.random() * participants.length);
        finalDisplayed.push(participants[randomIndex]);
      }
      // Put the winner in the center
      finalDisplayed.splice(4, 0, selectedWinner);
      setDisplayedParticipants(finalDisplayed);

      // Set the winner state
      setWinner(selectedWinner);
      setIsRaffling(false);

      // Apply highlight animation to the winner
      if (spinnerRef.current) {
        const items = spinnerRef.current.querySelectorAll(".participant-item");
        items[4].classList.add("winner-glow");
      }

      // Show winner modal after a short delay
      setTimeout(() => {
        setShowWinnerModal(true);
        // Trigger confetti when winner is displayed
        triggerConfetti();
      }, 1000);
    }, 6000); // Extended animation time to match 5 second countdown
  };

  // Modal close function
  const closeWinnerModal = () => {
    setShowWinnerModal(false);
  };

  // Load confetti library
  useEffect(() => {
    // Checks if we have con petty loaded already
    if (typeof window.confetti !== "function") {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
      script.async = true;

      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-6 text-center">Raffle Draw</h2>

      {/* Raffle visualization */}
      <div className="w-full max-w-xl relative">
        {/* Countdown overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center z-20 text-6xl font-bold text-white">
            {countdown}
          </div>
        )}

        {/* Raffle spinner */}
        <div
          ref={spinnerRef}
          className="grid grid-cols-3 md:grid-cols-5 gap-2 relative z-10"
        >
          {displayedParticipants.map((participant, index) => (
            <div
              key={index}
              className={`participant-item bg-gradient-to-br ${
                winner && participant === winner
                  ? "from-yellow-600 to-amber-900"
                  : index % 2 === 0
                  ? "from-blue-800 to-blue-900"
                  : "from-indigo-800 to-purple-900"
              } rounded-lg p-3 aspect-square flex flex-col items-center justify-center text-white shadow-lg transition-all duration-300 ${
                isRaffling ? "animate-pulse" : ""
              }`}
            >
              <div className="font-medium text-sm text-center truncate w-full">
                {participant?.name || "Participant"}
              </div>
              {participant?.campus && (
                <div className="text-xs opacity-80 mt-1 text-center truncate w-full">
                  {participant.campus}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <button
        onClick={startRaffle}
        disabled={isRaffling}
        className={`mt-6 px-6 py-3 text-lg font-bold rounded-md shadow-lg transition-all ${
          isRaffling
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700 active:transform active:scale-95"
        } text-white`}
      >
        {isRaffling ? "Selecting..." : "Draw Winner"}
      </button>

      {/* Participant counter */}
      <div className="mt-4 text-sm text-gray-400">
        {participants.length} participants in this raffle
      </div>

      {/* Winner Modal */}
      {showWinnerModal && winner && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-700 winner-modal-animation">
            {/* Modal header with close button */}
            <div className="p-5 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">
                Winner Announced!
              </h3>
              <button
                onClick={closeWinnerModal}
                className="text-gray-400 hover:text-white transition-colors focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 flex items-center justify-center mb-4">
                <span className="text-4xl">🏆</span>
              </div>
              <h4 className="text-3xl font-bold text-yellow-400 text-center mb-1">
                {winner.name || "Unknown Participant"}
              </h4>
              {winner.campus && (
                <p className="text-gray-400 text-center mb-4">
                  {winner.campus}
                </p>
              )}
              <div className="w-full bg-gray-700 h-px my-4"></div>
              <p className="text-gray-300 text-center mb-6">
                What would you like to do with this winner?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
                  onClick={() => {
                    onPickWinner(winner.id_number);
                    closeWinnerModal();
                    showToast(
                      "success",
                      `${winner.name} added to winners list!`
                    );
                  }}
                >
                  Add to Winners
                </button>
                <button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
                  onClick={() => {
                    onRemoveAttendee(winner.id_number);
                    closeWinnerModal();
                    showToast("info", `${winner.name} removed from raffle!`);
                  }}
                >
                  Remove from Raffle
                </button>
              </div>

              {/* Close button at the bottom */}
              <button
                className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md font-medium transition-colors"
                onClick={closeWinnerModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RafflePicker;
