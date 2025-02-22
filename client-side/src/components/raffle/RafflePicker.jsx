import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaDice } from 'react-icons/fa'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const RafflePicker = ({ participants }) => {
  const [winner, setWinner] = useState(null);
  const [isPicking, setIsPicking] = useState(false);
  const [displayedParticipant, setDisplayedParticipant] = useState(null);
  const [remainingParticipants, setRemainingParticipants] = useState([]);
  const [nextParticipant, setNextParticipant] = useState(null);

  useEffect(() => {
    setRemainingParticipants(participants);
    setWinner(null);
    setDisplayedParticipant(null);
    setNextParticipant(null);
  }, [participants]);

  const pickWinner = () => {
    setIsPicking(true);
    setWinner(null);
    let iterations = 0;
    const interval = setInterval(() => {
      const currentIndex = iterations % remainingParticipants.length;

      const currentParticipant = remainingParticipants[currentIndex];
			
      setDisplayedParticipant(currentParticipant);
      setNextParticipant(remainingParticipants[(currentIndex + 1) % remainingParticipants.length]);
      iterations++;
      if (iterations > 50) { // Number of iterations for the roulette effect
        clearInterval(interval);
        const finalIndex = Math.floor(Math.random() * remainingParticipants.length);
        const selectedWinner = remainingParticipants[finalIndex];
        setWinner(selectedWinner);
        setRemainingParticipants(remainingParticipants.filter(participant => participant !== selectedWinner));
        setIsPicking(false);
        toast.success(`Winner: ${selectedWinner}`, {
          position: "top-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    }, 100); // Speed of the roulette effect
  };

  return (
		<div className="w-full h-96 ">
			<div className='text-center mb-5' > 
				<ToastContainer /> 
				{winner && !isPicking && (
					<motion.div
						className="text-xl font-semibold text-green-600"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5 }}>
						{`Winner: ${winner}`}
					</motion.div>
				)}
      </div>
      		<div className="flex justify-center">

			<div className="w-full h-80 justify-center items-center">
			
				{/* <div className='w-48 h-24 bg-white rounded-md shadow-lg flex items-center justify-center overflow-hidden'>
          <AnimatePresence>
            {displayedParticipant && (
              <motion.div 
                className='text-2xl font-semibold text-gray-800'
                key={displayedParticipant}
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {displayedParticipant}
              </motion.div>
            )}
          </AnimatePresence>
        </div> */}
				<div className="w-full  mb-5 mx-auto h-64 bg-white rounded-md shadow-lg flex items-center justify-center overflow-hidden">
					<AnimatePresence> 
						{nextParticipant && (
						<motion.div
						className="text-2xl font-semibold text-gray-800"
						key={nextParticipant}
						initial={{ scale: 0, y: -50, opacity: 0 }}
						animate={{ scale: 1.2, y: 0, opacity: 1 }}
						exit={{ scale: 0.8, y: 50, opacity: 0 }}
						transition={{ type: "spring", stiffness: 1200, damping: 10 }}
					>
						
						{nextParticipant}
					</motion.div>
						)}
					</AnimatePresence>
				</div>
				<div> {/* For Button Component*/}
					<motion.button
						className={`bg-navy text-white ${
							isPicking ? "p-3 rounded-full" : "px-6 py-3 rounded-md"
						} shadow-lg hover:bg-primary transition duration-300 flex items-center justify-center mx-auto`}
						whileTap={{ scale: 0.95 }}
						onClick={pickWinner}
						disabled={isPicking || remainingParticipants.length === 0}>
						<motion.div
							animate={
								isPicking ? { rotate: [0, 360], scale: [1, 1.5, 1] } : {}
							}
							transition={
								isPicking
									? { repeat: Infinity, duration: 0.5, ease: "linear" }
									: {}
							}>
							<FaDice className={`${isPicking ? "" : "mr-2"}`} />
						</motion.div>
						{!isPicking && "Pick a Winner"}
					</motion.button>
				</div>
			</div>
		
			{remainingParticipants.length === 0 && (
				<div className="mt-4 text-2xl font-semibold text-red-600">
					No more participants left.
				</div>
			)}
			{/* <div className="w-48 ml-5 bg-white rounded-md shadow-lg text-center">
				<h1 class="text-sm sm:text-md md:text-md lg:text-lg font-semibold uppercase">Winners</h1>
				<div>DATA FOR WINNERS, TO BE INSERTED</div> */}
        {/* </div> */}
        </div>
		</div>
	);
}

export default RafflePicker
