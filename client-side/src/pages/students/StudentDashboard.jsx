import React from "react";
import { posts, events } from '../../@fakedb/data';
import Posts from "./dashboard/Posts";
import Events from "./dashboard/Events";
import OperationHours from "./dashboard/OperationHours";


function StudentDashboard() {
 

  return (
    <div className="flex justify-between gap-8 flex-col-reverse sm:flex-row">
        <Posts posts={posts} />
        <div className="space-y-4 px-4 ">

            <OperationHours />
            <Events events={events}/>
        </div>
    </div>
  );
}

export default StudentDashboard;
