import React, { useState, useEffect } from 'react'
import  {
  BrowserRouter as Router,
  Route, 
  Routes,
  useLocation,
} from 'react-router-dom'

import LandingLayout from './components/layout/LandingLayout'
import AdminLayout from './components/layout/AdminLayout'

import Home from './pages/Home'
import Explore from './pages/Explore'
import Faculty from './pages/Faculty'
import Team from './pages/Team'

import AdminDashboard from './pages/admin/AdminDashboard'
import Membership from './pages/admin/Membership'
import Merchandise from './pages/admin/Merchandise'
import Inventory from './pages/admin/Inventory'
import Orders from './pages/admin/Orders'
import Analytics from './pages/admin/Analytics'
import Resources from './pages/admin/Resources'
import Settings from './pages/admin/Settings'

import Login from './pages/authentication/Login'
import Register from './pages/authentication/Register'

import PrivateRouteAdmin from './authentication/privateRouteAdmin'
import NotFound from './components/common/NotFound'



const App = () => {

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<LandingLayout />}>
            <Route index element={<Home />}/>
            <Route path='/explore' element={<Explore />}/>
            <Route path='/faculty' element={<Faculty />}/>
            <Route path='/the-team' element={<Team />}/>
          </Route>
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route path="dashboard" element={<PrivateRouteAdmin element={AdminDashboard} />} />
            <Route path="membership" element={<PrivateRouteAdmin element={Membership} />} />
            <Route path="merchandise" element={<PrivateRouteAdmin element={Merchandise} />} />
            <Route path="inventory" element={<PrivateRouteAdmin element={Inventory} />} />
            <Route path="orders" element={<PrivateRouteAdmin element={Orders} />} />
            <Route path="analytics" element={<PrivateRouteAdmin element={Analytics} />} />
            <Route path="resources" element={<PrivateRouteAdmin element={Resources} />} />
            <Route path="settings" element={<PrivateRouteAdmin element={Settings} />} />
          </Route>
          {/* <Route path="/" element={<StudentLayout />} > */}
          <Route path="/login" element={<Login />}/>
          <Route path="/register" element={<Register />}/>


          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
