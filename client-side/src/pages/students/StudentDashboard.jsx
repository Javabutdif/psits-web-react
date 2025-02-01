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
			"https://psitsimagestorage.s3.ap-southeast-2.amazonaws.com/merchandise/1737705519302_image_2025-01-24_155728296.png",
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
			"https://psitsimagestorage.s3.ap-southeast-2.amazonaws.com/merchandise/1737705519302_image_2025-01-24_155728296.png",
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
		<div className="relative w-full max-w-md mx-auto rounded-lg overflow-hidden shadow-lg">
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
		<div className="max-w-[1600px] mx-auto grid grid-cols-1 py-5 md:grid-cols-2 lg:grid-cols-7 lg:flex lg:flex-row-reverse gap-6">
			{loading ? (
				<>
					<Skeleton className="h-[280px] md:col-span-2 lg:col-span-3 xl:col-span-2 lg:row-span-2" />
					<Skeleton className="h-[150px] md:col-span-2 lg:col-span-4 xl:col-span-5" />
					<Skeleton className="h-[400px] col-span-full" />
				</>
			) : (
				<>
					<div className="lg lg:flex lg:flex-col gap-6">
						<OperationHours styles="self-start lg:col-start-6 lg:col-end-8 lg:row-start-1 lg:row-end-3 mb-3" />
						<MembershipBanner styles="lg:row-start-3 lg:col-start-6 lg:col-end-8" />
					</div>
					<div className="lg:w-1/2">
						<DynamicAdCarousel />
						{/* Dynamic Ad Carousel */}
					</div>
				</>
			)}
		</div>
	);
};

export default StudentDashboard;
