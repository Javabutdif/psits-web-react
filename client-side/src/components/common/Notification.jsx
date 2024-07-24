import React, { useState } from 'react';


const Notification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = []; // Example notifications

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button onClick={toggleNotifications} className="relative">
        <span id="notif-count" className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
          {notifications.length}
        </span>
        <i className="fas fa-bell text-xl"></i>
      </button>
      {isOpen && <NotificationList notifications={notifications} />}
    </div>
  );
};



const NotificationList = ({ notifications }) => {
    return (
      <div className="absolute text-sm right-0 mt-2 w-30 bg-white border  border-gray-300 rounded-lg shadow-lg">
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <div key={index} className=" p-4 border-b border-gray-200 last:border-b-0">
              {notification}
            </div>
          ))
        ) : (
          <div className="p-4">No notifications</div>
        )}
      </div>
    );
  };



export default Notification;
