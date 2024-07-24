import React from "react";
import { posts, events } from '../../@fakedb/data';
import Posts from "./dashboard/Posts";
import Events from "./dashboard/Events";
import OperationHours from "./dashboard/OperationHours";


function StudentDashboard() {
 

  return (
    <div className="flex justify-between gap-8 flex-col-reverse md:flex-row">
        <Posts posts={posts} />
        <div className="md:space-y-4 lg:max-w-sm px-2 sm:px-4 flex sm:items-center md:items-stretch  gap-4 flex-col sm:flex-row md:flex-col">

            <OperationHours />
            <Events events={events}/>
        </div>
    </div>
  );
}

export default StudentDashboard;
