import backendConnection from "../../api/backendApi";
import { getInformationData } from "../../authentication/Authentication";
import MembershipBanner from "./dashboard/Membership";
import OperationHours from "./dashboard/OperationHours";
import Posts from "./dashboard/Posts";
import React, { useState, useEffect } from "react";

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 ${className}`}></div>
);

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
    <div className="max-w-[1600px] mx-auto grid grid-cols-1 gap-4 py-5 md:grid-cols-2 lg:grid-cols-7 ">
      {loading ? (
        <>
          {" "}
          <Skeleton className="h-[280px] md:col-span-2 lg:col-span-3 xl:col-span-2 lg:row-span-2" />
          <Skeleton className="h-[150px] md:col-span-2 lg:col-span-4 xl:col-span-5" />
          <Skeleton className="h-[400px] col-span-full" />
        </>
      ) : (
        <>
          <OperationHours
            styles={`self-start 
          
              lg:col-start-6 lg:col-end-8 lg:row-start-1 lg:row-end-3`}
          />
          <MembershipBanner styles="lg:row-start-3 lg:col-start-6 lg:col-end-8" />
          <Posts
            posts={posts}
            styles="col-span-full lg:row-start-1 lg:row-span-5 lg:col-span-5"
          />
        </>
      )}
    </div>
  );
};

export default StudentDashboard;
