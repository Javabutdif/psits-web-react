import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const StudentOrderTab = () => {
  const location = useLocation()

  const tabs = [
    { path: "/student/orders", text: "Pending", icon: "fas fa-clock" },
    { path: "/student/orders/paid", text: "Paid", icon: "fas fa-check-circle" },
  ]

  return (
    <div className="flex justify-around p-4 bg-gray-100">
      {tabs.map(tab => (
        <Link
          key={tab.path}
          to={tab.path}
          className={`flex items-center text-gray-800 hover:text-blue-500 ${location.pathname === tab.path ? 'text-blue-500 font-bold' : ''}`}
        >
          <i className={`${tab.icon} text-xl mr-2`}></i>
          <span>{tab.text}</span>
        </Link>
      ))}
    </div>
  )
}

export default StudentOrderTab
