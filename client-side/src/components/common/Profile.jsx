import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getUser } from '../../authentication/Authentication'

const Profile = () => {
  const location = useLocation().pathname.split('/')[1]
  const [name, position] = getUser()
  return (
    <div className="flex space-x-3 items-center">
      <Link to={`/${location === 'admin' ? 'admin' : location === 'student' ? 'student' : ''}/profile`}>
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
