import React, { useState } from 'react';
import MembershipTab from '../../components/admin/MembershipTab';
import { Outlet } from 'react-router-dom';

const Membership = () => {
  return (
    <div className="flex flex-col bg-gray-100">
      {/* Container for MembershipTab with responsive width */}
      <div className="w-full flex flex-col">
        <MembershipTab
          styles="flex flex-wrap gap-4 items-start bg-white shadow-sm rounded-t-sm"
        />
      </div>
      <Outlet/>
    </div>
  );
};

export default Membership;
