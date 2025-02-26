import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
// import Confetti from "react-confetti";
import { FaDice } from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RaffleWinnerModal from "./RaflleWinnerModal";
// import Confetti from "react-confetti";



const RafflePicker = ({ participants }) => {
  const [winner, setWinner] = useState(null);
  const [isPicking, setIsPicking] = useState(false);
  const [displayedParticipant, setDisplayedParticipant] = useState(null);
  const [remainingParticipants, setRemainingParticipants] = useState([]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showConfetti, setShowConfetti] = useState(false); // Confetti state
  const [showWinnerModal, setWinnerModal] = useState(false);
  const [winnerList, addWinnerToList] = useState(false);
  const [isDisplayingWinner, setIsDisplayingWinner] = useState(false);
  const [raffleWinners, setRaffleWinners] = useState([]);

  const containerRef = useRef(null);
  const [divSize, setDivSize] = useState({ width: 0, height: 0 });
  const handleShowWinnerModal = () =>{
    console.log("True");
    setWinnerModal(true);    
  }
  const handleCloseWinnerModal = () =>{
    console.log("False");
    setWinnerModal(false);    
  }


  useEffect(() => {
    
    setRemainingParticipants(participants);
    setWinner(null);
    
    setDisplayedParticipant(null);
  }, [participants]);

  useEffect(() => {
    if (containerRef.current) {
      setDivSize({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
    }
  }, []);

  const pickWinner = () => {
    setIsPicking(true);
    setWinner(null);
    setIsDisplayingWinner(false);
    handleCloseWinnerModal();
    setShowConfetti(false); // Reset confetti before picking

    let iterations = 0;
    const interval = setInterval(() => {
      const currentIndex = iterations % remainingParticipants.length;
      const currentParticipant = remainingParticipants[currentIndex];

      const buffer = 80;
      const randomX =
        Math.random() * (divSize.width - buffer * 2) - (divSize.width / 2 - buffer);
      const randomY =
        Math.random() * (divSize.height - buffer * 2) - (divSize.height / 2 - buffer);

      setPosition({ x: randomX, y: randomY });
      setDisplayedParticipant(currentParticipant);
      iterations++;

      if (iterations > 100) {
        clearInterval(interval);
        const finalIndex = Math.floor(Math.random() * remainingParticipants.length);
        const selectedWinner = remainingParticipants[finalIndex];
        setWinner(selectedWinner);
        setDisplayedParticipant(selectedWinner);
        setRemainingParticipants(remainingParticipants.filter((participant) => participant !== selectedWinner));
        setIsPicking(false);
        setShowConfetti(true); // 🎉 Trigger confetti!
        setIsDisplayingWinner(true);

        // toast.success(`Winner: ${selectedWinner}`, {
        //   position: "top-left",
        //   autoClose: 5000,
        //   hideProgressBar: false,
        //   closeOnClick: true,
        //   pauseOnHover: true,
        //   draggable: true,
        // });

        setTimeout(() => {
          handleShowWinnerModal();
          setIsDisplayingWinner(false);
          setShowConfetti(false);
        }, 1000 );
        
      }
    }, 100);
  };

  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center relative">
			     {/* PAMPA DISPLAY CONFETTI */}
			{/* {showConfetti && (
				<Confetti
					width={window.innerWidth}
					height={window.innerHeight}
					confettiSource={{ x: window.innerWidth * 0, y: -100, w: 1000, h: 200 }} // Moves it to the left
				/>
			)} */}

      <ToastContainer />
 
      {/* {winner && !isPicking && (
        <motion.div
          className="text-xl font-semibold text-green-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {`Winner: ${winner}`}
        </motion.div>
      )} */}

      <div
			// KANI KAY ANG CIRCLE
      ref={containerRef}
      className="relative w-[70vh] h-[70vh] mb-5 mx-auto rounded-full border-white/30 bg-white/20 backdrop-blur-lg flex items-center justify-center overflow-hidden animate-spinGlow"
      style={{
        background: `radial-gradient(circle at 50% 50%, 
          rgba(180, 230, 255, 0.3) 40%, 
          rgba(80, 180, 255, 0.25) 60%, 
          rgba(22, 130, 200, 0.3) 80%, 
          rgba(10, 100, 160, 0.4) 100%)`
      }}
      >
   {/* <motion.div
  className="absolute w-full h-full border-[10px] border-transparent  rounded-full"
  animate={{ rotate: 360, boxShadow: [
      "0 0 15px 5px rgba(0, 191, 255, 0.3), 0 0 30px 10px rgba(0, 191, 255, 0.15)",
      "0 0 25px 10px rgba(0, 191, 255, 0.5), 0 0 40px 15px rgba(0, 191, 255, 0.3)",
      "0 0 15px 5px rgba(0, 191, 255, 0.3), 0 0 30px 10px rgba(0, 191, 255, 0.15)",
    ] }}
  transition={{ 
    rotate: { duration: 1, ease: "linear", repeat: Infinity },
    boxShadow: { duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }
  }}
  style={{ filter: "blur(3px)" }}
/> */}



  
				{/* KANI NGA PART KAY MAO NI ANG LOADING KATO MO TUYOK */}
        {isPicking && (
          <motion.div
            className="absolute w-full h-full border-[10px] border-transparent border-t-primary border-r-navy rounded-full"
            animate={{ rotate: 360, borderWidth: [4] }}
            transition={{ duration: 0.5, ease: "linear", repeat: Infinity }}
          />
        )}

				{/* KANI KAY MAO NING ANIMATION WHILE PICKING INSIDE SA CIRCLE */}
        <AnimatePresence>
          {displayedParticipant && (
            <motion.div
              key={displayedParticipant}
              className="absolute text-2xl md:text-2xl lg:text-4xl font-bold text-gray-900"
              initial={{ scale: 0, opacity: 0, x: position.x, y: position.y }}
              animate={{
                scale: [1, 1.3, 0.9, 1.1, 1],
                opacity: 1,
                x: winner ? 0 : position.x,
                y: winner ? 0 : position.y,
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {displayedParticipant}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

{/* KANI KAY BUTTON SA PICK A WINNER */}

    {/* {!isDisplayingWinner && (


    )} */}
    <motion.button
        className={`relative bg-navy text-white ${
          isPicking || isDisplayingWinner ? "p-3 rounded-full opacity-50" : "px-6 py-3 rounded-md"
        } shadow-lg hover:bg-primary transition duration-300 flex items-center justify-center mx-auto`}
        whileTap={{ scale: 0.95 }}
        onClick={pickWinner}
        disabled={isPicking || isDisplayingWinner|| remainingParticipants.length === 0}
      >
        <motion.div
          animate={isPicking ? { rotate: [0, 180, 360], scale: [1, 1.2, 1] } : {}}
          transition={isPicking ? { repeat: Infinity, duration: 0.4, ease: "linear" } : {}}
        >
          <FaDice className={`${isPicking ? "" : "mr-2"}`} />
        </motion.div>
        {!isPicking ? "Pick a Winner" : "Picking..."}
      </motion.button>
      

      {remainingParticipants.length === 0 && (
        <div className="mt-4 text-2xl font-semibold text-red-600">
          No more participants left.
        </div>
      )}

      {
        showWinnerModal &&  !isPicking &&(
          <RaffleWinnerModal
          studentData ={winner}
          handleCloseModal={handleCloseWinnerModal}
          handleCloseConfetti={showConfetti}
          autoClose={10000}
          />
        )
      }

    </div>
    
  );


};

export default RafflePicker;
