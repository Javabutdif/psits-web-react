import React from "react";
import { posts, events } from "../../@fakedb/data";
import Posts from "./dashboard/Posts";
import Events from "./dashboard/Events";
import OperationHours from "./dashboard/OperationHours";
import MembershipBanner from "./dashboard/Membership";
import { getMembershipStatus } from "../../authentication/Authentication";

function StudentDashboard() {
  const membershipStatus = getMembershipStatus();

  return (
    <main className="grid grid-cols-1 lg:grid-rows-[300px_250px_300px] gap-4 py-5 lg:grid-cols-3 xl:grid-cols-5">
      {/* Events Section */}
      <div className="md:col-span-1 lg:col-span-1 lg:row-start-3 xl:row-start-1 xl:col-start-5 ">
        <Events events={events} />
      </div>

      {/* Posts Section */}
      <div className="md:col-span-1 lg:col-span-2 xl:col-span-3">
        <Posts posts={posts} />
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
