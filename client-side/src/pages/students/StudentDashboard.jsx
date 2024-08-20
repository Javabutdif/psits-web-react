import React, { useEffect, useState } from "react";
import { events } from "../../@fakedb/data";
import Posts from "./dashboard/Posts";
import Events from "./dashboard/Events";
import OperationHours from "./dashboard/OperationHours";
import MembershipBanner from "./dashboard/Membership";
import { getMembershipStatus } from "../../authentication/Authentication";
import { InfinitySpin } from "react-loader-spinner";
import backendConnection from "../../api/backendApi";

function StudentDashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const membershipStatus = getMembershipStatus();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${backendConnection}/api/facebook`);
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

    fetchPosts();
  }, []);

  return (
    <main className="grid grid-cols-1 lg:grid-rows-[300px_250px_300px] gap-4 py-5 lg:grid-cols-3 xl:grid-cols-5">
      {/* Events Section */}
      <div className="md:col-span-1 lg:col-span-1 lg:row-start-3 xl:row-start-1 xl:col-start-5">
        <Events events={events} />
      </div>

      {/* Posts Section */}
      <div className="md:col-span-1 lg:col-span-2 xl:col-span-3">
        {loading && (
          <div className="flex justify-center items-center h-full">
            <InfinitySpin
              visible={true}
              width="200"
              color="#0d6efd"
              ariaLabel="infinity-spin-loading"
            />
          </div>
        )}
        {error && (
          <div className="text-red-500 text-center">
            <p>Error: {error}</p>
          </div>
        )}
        {!loading && !error && <Posts posts={posts} />}
      </div>

      {/* Operation Hours and Membership Banner */}
      <div className="row-start-1 md:col-span-1 lg:col-span-1 xl:col-span-1 flex flex-col gap-5">
        <OperationHours />
        {membershipStatus === "None" && <MembershipBanner />}
      </div>
    </main>
  );
}

export default StudentDashboard;
