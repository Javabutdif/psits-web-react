import React from 'react'
import Footer from '../common/Footer'
import Navbar from '../common/Navbar'
import { Outlet } from 'react-router-dom'

const LandingLayout = () => {
  return (
    <>
        <Navbar />
        <Outlet />
        <Footer />        
    </>
  )
}

export default LandingLayout
