import backendConnection from "../../api/backendApi";
import { fetchSpecificStudent } from "../../api/students";
import MembershipBanner from "./dashboard/Membership";
import OperationHours from "./dashboard/OperationHours";
import { merchandise } from "../../api/admin";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getInformationData } from "../../authentication/Authentication";
import { Link } from "react-router-dom";
import { getEvents } from "../../api/event";
import ads from "../../assets/images/ads.png";
import {IctMessage} from '../Events.jsx';
import { AkweMessage } from "../Events.jsx";
import CircularGallery from '../../components/Image/CircularGallery';
import BarGraph from "../admin/dashboard/BarGraph";
import DoughnutChart from '../admin/dashboard/DoughnutChart';
import ForcedInputModal from "../../components/common/modal/ForcedInputModal.jsx";


const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 ${className}`}></div>
);

const StudentDashboard = () => {
  const userData = getInformationData();
  const [isRequest, setIsRequest] = useState(false);
  const [products, setProducts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentDate = new Date();
  const end = new Date(currentDate.getFullYear(), 10, 30);
  const token = sessionStorage.getItem("Token");
  const [isModalOpen, setIsModalOpen] = useState(true);
  

  const fetchAllEvents = async () => {
    const currentDate = new Date();
    const result = await getEvents();

    if (result && result.data) {
      const upcomingEvents = result.data.filter((event) => {
        const eventDate = new Date(event.eventDate);
        // Set time to 00:00:00 for comparison if you're only comparing date
        eventDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);
        return eventDate >= currentDate;
      });

     
      setEvents(upcomingEvents);
    }
  };

  const handleFetchSpecificStudent = async () => {
    try {
      const result = await fetchSpecificStudent(userData.id_number);
      setIsRequest(result ? result.isRequest : false);
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  };

  const fetchMerchandise = async () => {
    try {
      const result = await merchandise();
      const currentDate = new Date();       

      if (result) {
        const filteredProducts = result.filter((item) => {
          const startDate = new Date(item.start_date);
          const endDate = new Date(item.end_date);
          const selectedAudienceArray = item.selectedAudience.includes(",")
            ? item.selectedAudience.split(",").map((aud) => aud.trim())
            : [item.selectedAudience];

          return (
            currentDate <= endDate &&
            (selectedAudienceArray.some(
              (audience) => userData.audience.includes(audience) && !isRequest
            ) ||
              selectedAudienceArray.includes("all"))
          );
        });
        setProducts(filteredProducts ? filteredProducts : []);
      } else setProducts([]);
    } catch (error) {
      console.error("Error fetching merchandise:", error);
    }
  };
  const handleFormSubmit = (data) => {
    // console.log(data);
    setNewUserData(data);
    setIsModalOpen(false); 
  };

 const IntramsMessage = () => {
   const [showMore, setShowMore] = useState(false);
 
   const toggleShowMore = () => {
     setShowMore(!showMore);
   };
   return (
     <>
       <div className=" z-20 mt-2 relative bg-gradient-to-br from-secondary to-primary  text-neutral-light p-4 md:p-6 shadow-md w-full">
         <div
           className="absolute w-16 h-16 md:w-20 md:h-20 bg-primary bg-opacity-30"
           style={{ top: "5%", right: "5%" }}
         ></div>
         <div
           className="absolute w-20 h-20 md:w-24 md:h-24 bg-secondary bg-opacity-30"
           style={{ top: "30%", left: "50%", transform: "translateX(-50%)" }}
         ></div>
         <div
           className="absolute w-16 h-16 md:w-20 md:h-20 bg-accent bg-opacity-30"
           style={{ top: "60%", left: "80%" }}
         ></div>
         <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6">
           𝑨𝒏 𝑬𝒗𝒆𝒏𝒕 𝑳𝒊𝒌𝒆 𝑵𝒐 𝑶𝒕𝒉𝒆𝒓; 60𝒕𝒉 𝒀𝒆𝒂𝒓 𝒐𝒇 𝑼𝑪 𝑰𝒏𝒕𝒓𝒂𝒎𝒖𝒓𝒂𝒍𝒔
         </h2>
         <div className="text-base md:text-lg mb-4">
           <p>
             One of the most awaited events of every UCian is the 𝐚𝐧𝐧𝐮𝐚𝐥
             𝐜𝐞𝐥𝐞𝐛𝐫𝐚𝐭𝐢𝐨𝐧 𝐨𝐟 𝐈𝐧𝐭𝐫𝐚𝐦𝐮𝐫𝐚𝐥𝐬, and this year is no other. An event
             where all college departments battle each other to stand above the
             rest; an event that allows UCians to showcase their talents and
             skills; an
           </p>
           {showMore && (
             <>
               <p>
                 event that unites all UCians from every campus; an event that
                 shows the spirit and enthusiasm of every UCians; an event like
                 no other, that is the true essence of UC Intramurals.
               </p>
               <br />
               <p>
                 This year marks the 60th anniversary, thus the event has been
                 made grandeur and bigger thanks to our amazing organizers and
                 staff. Along with the opening of the Intramurals, the
                 most-awaited 𝓑𝓻𝓮𝓪𝓴𝓸𝓾𝓽 𝓒𝓸𝓷𝓬𝓮𝓻𝓽 is back at it once again with more
                 amazing performances full of 𝐡𝐲𝐩𝐞, 𝐬𝐰𝐚𝐠, 𝐚𝐧𝐝 𝐠𝐫𝐨𝐨𝐯𝐞. The talents
                 of the 𝑼𝑪 𝑻𝒉𝒆𝒂𝒕𝒓𝒆 are also seen with their tear-jerking and
                 relatable song lists. As a tribute, we present this video
                 showcasing the highlights of the Intramurals 2024 opening
                 ceremony on 𝐍𝐨𝐯𝐞𝐦𝐛𝐞𝐫 20, 2024. 𝐓𝐡𝐚𝐧𝐤 𝐲𝐨𝐮 𝐚𝐧𝐝 𝐡𝐚𝐯𝐞 𝐟𝐮𝐧 𝐰𝐚𝐭𝐜𝐡𝐢𝐧𝐠!
               </p>
             </>
           )}
         </div>
         <button
           onClick={toggleShowMore}
           className="mt-2 text-white underline focus:outline-none"
         >
           {showMore ? "See less" : "See more"}
         </button>
         <p className="text-base md:text-lg flex flex-col pt-4">
           <span> Video | Carl David L Binghay</span>
           <span>Editor | Carl David L Binghay </span>
           <span>Captions | Arvin Albeos</span>
           <span>#UCIntramurals2024</span>
         </p>
       </div>
     </>
   );
 };

   const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  useEffect(() => {
    setLoading(true);
    if (!token) return;
    const fetchData = async () => {
      await Promise.all([
        fetchMerchandise(),
        fetchAllEvents(),
        handleFetchSpecificStudent(),
      ]);
      setLoading(false);
    };
    fetchData();
  }, [token]);

  

  return (
    <div className="max-w-[1600px] mx-auto grid grid-cols-1 py-5 md:grid-cols-1 lg:grid-cols-7 lg:flex gap-6">
      {/* Modal at the root level */}
      <ForcedInputModal isOpen={isModalOpen} onSubmit={handleFormSubmit} />
      {loading ? (
        <>
          <Skeleton className="h-[280px] md:col-span-2 lg:col-span-3 xl:col-span-2 lg:row-span-2" />
          <Skeleton className="h-[150px] md:col-span-2 lg:col-span-4 xl:col-span-5" />
          <Skeleton className="h-[400px] col-span-full" />
        </>
      ) : (
        <>
          {/* Right Section (Operation Hours & Membership Banner) */}
         <div className="lg:order-last md:order-first">
            <OperationHours styles="self-start lg:col-start-6 lg:col-end-8 lg:row-start-1 lg:row-end-3 mb-3" />
            <MembershipBanner styles="lg:row-start-3 lg:col-start-6 lg:col-end-8" />
             {currentDate <= end && (
              <div className="lg:row-start-3 lg:col-start-6 lg:col-end-8 mt-2 rounded-lg overflow-hidden shadow-lg">
                <img src={ads} alt="ads" className="w-full h-40 object-cover" />
              </div>
            )}
          </div>

          {/* Left Section (Carousel & Events) */}
          <div className="lg:w-full items-center justify-center flex flex-col ">
            {products.length > 0 && <DynamicAdCarousel products={products} />}
              <EventDetails events={events} />

            <div className="flex items-center my-4 mt-10 mb-32 text-gray-400">
              <div className="flex-shrink-0">― ― ― ―</div>
                <span className="flex-shrink mx-4 text-center font-semibold text-[#074873]">Recent Activities</span>
              <div className="flex-shrink-0">― ― ― ―</div>
            </div>

            <div>
            
              <IntramsMessage/>
            </div>
            <div 
                style={{ 
                  height: '380px', 
                  width: '95%', 
                  maxWidth: '1000px', 
                  position: 'relative',
                }}
                className="mb-36"
              > 
                <CircularGallery 
                  bend={3} 
                  textColor="#074873" 
                  fontborderRadius={0.05}  
                /> 
            </div>
            <div>
                <AkweMessage/>
            </div>
          </div>
        </>
      )}
    </div>
  );  
};
const DynamicAdCarousel = ({ products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (products.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [products.length]);

  return (
    <div className="relative w-full max-w-lg mx-auto rounded-lg overflow-hidden shadow-lg">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="w-full h-64">
            <img
              src={products[currentIndex]?.imageUrl[0]}
              alt="Ad"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-white p-4">
            <motion.h2
              className="text-2xl font-bold text-center"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {products[currentIndex]?.name}
            </motion.h2>
            <motion.p
              className="text-center text-sm mt-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7 }}
            >
              {products[currentIndex]?.description}
            </motion.p>
            <Link to="/student/merchandise">
              <motion.button
                className="mt-4 px-4 py-2 bg-[#368ec9] text-white rounded-lg shadow-lg hover:bg-[#074873] transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                Shop Now
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
const EventDetails = ({ events }) => {
  const [showAll, setShowAll] = useState(false);
  const [showDescription, setShowDescription] = useState({});

  const toggleDescription = (index) => {
    setShowDescription((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="w-full max-w-xl mt-7 mx-auto p-6 bg-white border rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-center text-[#074873] mb-4">
        Upcoming Events
      </h2>
      <div className="space-y-4">
        {events.length > 0 ? (
          events.slice(0, showAll ? events.length : 3).map((event, index) => (
            <div
              key={index}
              className="items-center p-4 border border-blue-200 rounded-lg flex flex-col"
            >
              <div className="flex gap-2 text-[#074873] w-full">
                <div className="w-10 h-10 flex items-center justify-center border border-[#074873] rounded-full">
                  <i className="far fa-calendar"></i>
                </div>
                <p className="text-sm font-semibold mt-2">{event.eventName}</p>
              </div>
              <div className="pl-1 w-full">
                <p className="text-xs sm:text-sm text-gray-700">
                  <span className="font-semibold">
                    {showDescription[index]
                      ? event.eventDescription
                      : `${event.eventDescription.slice(0, 50)}...`}
                  </span>
                  {event.eventDescription.length > 50 && (
                    <span
                      className="text-blue-500 cursor-pointer ml-1"
                      onClick={() => toggleDescription(index)}
                    >
                      {showDescription[index] ? " Show less" : " Read more"}
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(event.eventDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>No events available...</p>
          </div>
        )}
      </div>
      <div className="mt-6 text-center">
        {!showAll && events.length > 3 && (
          <button
            onClick={() => setShowAll(true)}
            className="text-xs px-4 py-2 bg-[#074873] hover:bg-[#1E6F8C] text-white font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out"
          >
            View All Events
          </button>
        )}
        {showAll && (
          <button
            onClick={() => setShowAll(false)}
            className="mt-4 px-4 py-2 bg-red-700 text-white font-semibold rounded-full shadow-md hover:bg-red-800 transition-all duration-300 ease-in-out"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
    
      </div>
    </div>
  );
};

export default StudentDashboard;
