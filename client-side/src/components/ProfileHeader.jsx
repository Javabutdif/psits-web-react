import React from 'react'
import Notification from './common/Notification'
import Profile from './common/Profile'
import { Link } from 'react-router-dom'

const ProfileHeader = ({ label }) => {

  return (
    <div className=" z-10 top-2 md:top-5  fixed w-header sm:w-header-sm ">
      <div className="flex  justify-between items-center gap-2 container mx-auto bg-white py-4 px-2 rounded-md">
        <h1 className="text-md sm:text-lg md:text-2xl font-bold capitalize">{label}</h1>
        <div className="flex items-center  gap-6 text-lg">
            <Notification />
            <Profile />
        </div>


      </div>
    </div>
  )
}

export default ProfileHeader
