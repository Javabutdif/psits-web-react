import React from 'react'
import Footer from '../common/Footer'
import Navbar from '../common/navbar/Navbar'
import { Outlet } from 'react-router-dom'

const LandingLayout = () => {

  return (
    <>
        <Navbar />
        {/* bg-gradient-to-b from-primary via-secondary via-tertiary via-accent to-muted */}
          <main className="overflow-hidden bg-gradient-to-b from-primary via-secondary via-tertiary via-accent to-muted">
            <Outlet />
          </main>
        <Footer />        
    </>
  )
}

export default LandingLayout
