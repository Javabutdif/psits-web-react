import React from 'react'
import { motion, useScroll } from 'framer-motion'
import Footer from '../common/Footer'
import Navbar from '../common/navbar/Navbar'
import { Outlet } from 'react-router-dom'

const LandingLayout = () => {
  const { scrollYProgress } = useScroll();

  return (
    <>
      <motion.div  className="fixed h-2 bg-red-400 top-0 left-0" style={{ scaleX: scrollYProgress}}/>
        <Navbar />
          <main className="">
            <Outlet />
          </main>
        <Footer />        
    </>
  )
}

export default LandingLayout
