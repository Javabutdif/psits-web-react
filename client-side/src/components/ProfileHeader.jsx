import React from 'react'
import Notification from './common/Notification'
import Profile from './common/Profile'
import { Link } from 'react-router-dom'
import { getAdmin } from '../authentication/Authentication'

const ProfileHeader = ({ label }) => {
  const admin = getAdmin();

  return (
    <div className="z-10 fixed w-header p-4 flex justify-between items-center gap-4 bg-white border">

        <h1 className="text-md md:text-lg lg:text-2xl font-bold capitalize">{label}</h1>
        <div className="flex items-center  gap-6 text-lg">
            <Notification />
            <Profile />
        </div>
    </div>
  )
}

export default ProfileHeader
