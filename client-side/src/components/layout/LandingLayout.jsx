import React from 'react'
import Footer from '../common/Footer'
import Navbar from '../common/navbar/Navbar'
import { Outlet } from 'react-router-dom'

const LandingLayout = () => {

  return (
    <>
        <Navbar />
          <main className="overflow-hidden">
            <Outlet />
          </main>
        <Footer />        
    </>
  )
}

export default LandingLayout
