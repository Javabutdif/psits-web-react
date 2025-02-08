import backendConnection from "../../api/backendApi";
import { fetchSpecificStudent } from "../../api/students";
import MembershipBanner from "./dashboard/Membership";
import OperationHours from "./dashboard/OperationHours";
import { merchandise } from "../../api/admin";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getInformationData } from "../../authentication/Authentication";
import { Link } from "react-router-dom";

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 ${className}`}></div>
);

const StudentDashboard = () => {
  const userData = getInformationData();
  const [isRequest, setIsRequest] = useState(false);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

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

  const handleFetchSpecificStudent = async () => {
    try {
      const result = await fetchSpecificStudent(userData.id_number);
      if (result) setIsRequest(result.isRequest);
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  };

  const fetchMerchandise = async () => {
    try {
      const result = await merchandise();
      const currentDate = new Date();

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

      setProducts(filteredProducts);
    } catch (error) {
      console.error("Error fetching merchandise:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await backendConnection.get("/events");
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchMerchandise(),
        fetchEvents(),
        handleFetchSpecificStudent(),
      ]);
      setLoading(false);
    };
    fetchData();
  }, [isRequest]);

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
          {/* Right Section (Operation Hours & Membership Banner) */}
          <div className="lg:order-last md:order-last">
            <OperationHours styles="self-start lg:col-start-6 lg:col-end-8 lg:row-start-1 lg:row-end-3 mb-3" />
            <MembershipBanner styles="lg:row-start-3 lg:col-start-6 lg:col-end-8" />
          </div>

          {/* Left Section (Carousel & Events) */}
          <div className="lg:w-full">
            {products.length > 0 && <DynamicAdCarousel products={products} />}
            <EventDetails events={events} />
          </div>
        </>
      )}
    </div>
  );
};

// Fixing Dynamic Ad Carousel
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
          <img
            src={products[currentIndex]?.imageUrl[0]}
            alt="Ad"
            className="w-full h-auto object-cover"
          />

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
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-all"
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
  const [showBTN, setBTN] = useState(false);

  const visibleEvents = showAll ? events : events.slice(0, 3);

  return (
    <div className="max-w-xl mt-7 mx-auto p-6 bg-white border rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-center text-[#074873] mb-4">
        Upcoming Events
      </h2>
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
                    <span className="font-semibold">{detail.name}:</span>{" "}
                    {detail.time}
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
            <i class="fas fa-times"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
