import backendConnection from "../../api/backendApi";
import { getInformationData } from "../../authentication/Authentication";
import MembershipBanner from "./dashboard/Membership";
import OperationHours from "./dashboard/OperationHours";
import Posts from "./dashboard/Posts";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Skeleton = ({ className }) => (
	<div className={`animate-pulse bg-gray-200 ${className}`}></div>
);

const ads = [
	{
		imageUrl:
			"https://psitsimagestorage.s3.ap-southeast-2.amazonaws.com/merchandise/1726150336082_white.jpg",
		title: "Special Discount!",
		description: "Get 50% off on selected items!",
	},
	{
		imageUrl:
			"https://psitsimagestorage.s3.ap-southeast-2.amazonaws.com/merchandise/1737705519302_image_2025-01-24_155728296.png",
		title: "Flash Sale",
		description: "Limited time offer, don't miss out!",
	},
	{
		imageUrl:
			"https://scontent.fceb3-1.fna.fbcdn.net/v/t39.30808-6/473188419_122182051154248106_4535652441260155354_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeHYFGQ-hqMsjsWtHJM-j3oq48EBYkR_P2jjwQFiRH8_aAn2UM0C97fep_xo4s15sVfL0-n_Uw5n1a1TikJ89ghE&_nc_ohc=5Rk390h0GDIQ7kNvgG7OcXL&_nc_oc=AdgfEz6VzAcSnDM-9LwRzPlA65vveN8UpGtrTZqMGadjCXsSdK0j2myV9zq1ll8-Ayk&_nc_zt=23&_nc_ht=scontent.fceb3-1.fna&_nc_gid=AcHGrKfiryMVlHFpk-Bic5f&oh=00_AYBG8CH_lc5muifTAYOEdbmcA2v1wcu_iMIA6jCFHt_sbQ&oe=67A802A3",
		title: "Exclusive Deals",
		description: "Shop now and save big!",
	},
];

const DynamicAdCarousel = () => {
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
		}, 2000); // Auto-change every 5 seconds

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="relative w-full max-w-lg mx-auto rounded-lg overflow-hidden shadow-lg">
			<AnimatePresence mode="wait">
				<motion.div
					key={currentIndex}
					initial={{ opacity: 0, x: 50 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -50 }}
					transition={{ duration: 0.5 }}
					className="relative">
					<img
						src={ads[currentIndex].imageUrl}
						alt="Ad"
						className="w-full h-auto object-cover"
					/>
          
					<div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-white p-4">
						<motion.h2
							className="text-2xl font-bold text-center"
							initial={{ y: -20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ duration: 0.5 }}>
							{ads[currentIndex].title}
						</motion.h2>
						<motion.p
							className="text-center text-sm mt-2"
							initial={{ y: 20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ duration: 0.7 }}>
							{ads[currentIndex].description}
						</motion.p>
						<motion.button
							className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-all"
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}>
							Shop Now
						</motion.button>
					</div>
				</motion.div>
			</AnimatePresence>
		</div>
	);
};

const events = [
  {
    date: "Feb. 14",
    details: [
      { name: "Love Month", time: "7:00 am - 8:00 am" },
      { name: "Guest Lecture", time: "1:00 pm - 4:00 pm" },
    ],
  },
  {
    date: "Feb. 17",
    details: [
      { name: "UC Days", time: "7:00 am - 8:00 am" },
      { name: "Guest Lecture", time: "1:00 pm - 4:00 pm" },
    ],
  },
  {
    date: "April 22",
    details: [
      { name: "ICT Congress", time: "7:00 am - 8:00 am" },
      { name: "Guest Lecture", time: "1:00 pm - 4:00 pm" },
    ],
  },
  {
    date: "June 15",
    details: [
      { name: "Intrams", time: "7:00 am - 8:00 am" },
      { name: "Guest Lecture", time: "1:00 pm - 4:00 pm" },
    ],
  },
  {
    date: "Aug. 15",
    details: [
      { name: "Intrams", time: "7:00 am - 8:00 am" },
      { name: "Guest Lecture", time: "1:00 pm - 4:00 pm" },
    ],
  },
  // Add more events 
];

const EventDetails = () => {
  const [showAll, setShowAll] = useState(false);
  const [showBTN, setBTN] = useState(false);

  const visibleEvents = showAll ? events : events.slice(0, 3);
  

  return (
    <div className="max-w-xl mt-7 mx-auto p-6 bg-white border rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-center text-[#074873] mb-4">Upcoming Events</h2>
      <div className="space-y-4">
        {visibleEvents.map((event, index) => (
          <div
            key={index}
            className="items-center p-4 border border-blue-200 rounded-lg flex "
          >
            <div className="flex gap-2 text-[#074873] w-[150px] ">
              <div className="w-10 h-10 flex items-center justify-center border border-[#074873] rounded-full">
              <i class="far fa-calendar"></i>
              </div>
              <p className="text-sm font-semibold mt-2">{event.date}</p>
            </div>
            <div className="pl-1">
              <div className="">
              {event.details.map((detail, idx) => (
               <p key={idx} className="text-xs sm:text-sm text-gray-700 ">
							 <span className="font-semibold">{detail.name}:</span> {detail.time}
						 </p>
						 
              ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        {!showAll && (
          <button
            onClick={() => {
              setShowAll(true);
              setBTN(true);
            }}
            className="text-xs px-4 py-2 bg-[#074873] hover:bg-[#1E6F8C] text-white font-semibold rounded-lg shadow-md  transition-all duration-300 ease-in-out"
          >
            View All Events
          </button>
        )}
        {showBTN && (
          <button
            onClick={() => {
              setShowAll(false);
              setBTN(false);
            }}
            className="mt-4 px-4 py-2 bg-red-700 text-white font-semibold rounded-full shadow-md hover:bg-red-800  transition-all duration-300 ease-in-out"
          >
            <i class="fas fa-times" ></i>
          </button>
        )}
      </div>
    </div>
  );
};
const StudentDashboard = () => {
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const hasReloaded = sessionStorage.getItem("hasReloaded");
		if (!hasReloaded) {
			sessionStorage.setItem("hasReloaded", "true");
			window.location.reload();
		}
	}, []);

	const fetchPosts = async () => {
		try {
			const response = await fetch(`${backendConnection()}/api/facebook`);
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const data = await response.json();
			setPosts(data);
		} catch (error) {
			console.error(error.message);
			setError("There is an error with fetching posts data.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const delayFetch = setTimeout(() => {
			fetchPosts();
		}, 2000);
		return () => clearTimeout(delayFetch);
	}, []);

	return (
		<div className="max-w-[1600px] mx-auto grid grid-cols-1 py-5 md:grid-cols-2 lg:grid-cols-7 lg:flex gap-6">
			{loading ? (
				<>
					<Skeleton className="h-[280px] md:col-span-2 lg:col-span-3 xl:col-span-2 lg:row-span-2" />
					<Skeleton className="h-[150px] md:col-span-2 lg:col-span-4 xl:col-span-5" />
					<Skeleton className="h-[400px] col-span-full" />
				</>
			) : (
				<>
				
					<div className="lg:order-last md:order-last">
				
						<OperationHours styles="self-start lg:col-start-6 lg:col-end-8 lg:row-start-1 lg:row-end-3 mb-3" />
						<MembershipBanner styles="lg:row-start-3 lg:col-start-6 lg:col-end-8" />

						{/* Dynamic Ad Carousel */}
					</div>
					<div className="  lg:w-full  ">
					<DynamicAdCarousel />
					<EventDetails />
					</div>
         
				</>
			)}
		</div>
	);
};



export default StudentDashboard;
