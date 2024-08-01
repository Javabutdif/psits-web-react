import React, { useState } from "react";
import { posts, events } from "../../@fakedb/data";
import Posts from "./dashboard/Posts";
import Events from "./dashboard/Events";
import OperationHours from "./dashboard/OperationHours";
import MembershipBanner from "./dashboard/Membership";
import { getMembershipStatus } from "../../authentication/Authentication";

function StudentDashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8 ">
      {/* Events Section */}
      <div className="col-start-1 col-span-1 ">
        <Events events={events} />
      </div>

      {/* Posts Section */}
      <div className=" col-span-1 md:col-span-2  row-span-2 lg:col-span-2">
        <Posts posts={posts} />
      </div>

      {/* Operation Hours and Membership Banner */}
      <div className="row-start-1  w-full lg:row-auto row-span-4 lg:col-span-1 flex flex-col gap-4">
        <OperationHours />
        {getMembershipStatus() === "None" && <MembershipBanner />}
      </div>
    </div>
  );
}

export default StudentDashboard;
