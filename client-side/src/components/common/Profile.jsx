import React from 'react'
import { Link } from 'react-router-dom'
import { getAdmin } from '../../authentication/Authentication'

const Profile = () => {
  const [ name, position ] = getAdmin()
  return (
    <div className="flex space-x-3 items-center">
        <Link to="/admin/profile">
            <i className="fas fa-user"></i>
        </Link>
        <h3 className="text-sm hidden sm:block">
          {name}
          <span className="text-xs block">{position}</span>
        </h3>
    </div>
  )
}

export default Profile
