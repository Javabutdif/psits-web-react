import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

const MarkAsPresent = () => {
  const { eventId, attendeeId } = useParams();
  const [attendeeData, setAttendeeData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  //TODO: enable visiting of this component just by pasting URL
  const { state } = location;

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold text-center mb-4">
          Are you sure you want to mark{" "}
          <span className="font-bold">{"Attendee ID - Attendee Name"}</span>{" "}
          present for the event{" "}
          <span className="font-bold">{state.eventName}</span>?
        </h2>
        <div className="flex justify-around">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            onClick={() => {
              navigate(-1);
            }}
          >
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Mark As Present
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarkAsPresent;
