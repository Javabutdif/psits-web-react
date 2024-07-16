import { useEffect, useState} from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SideBar from '../common/navbar/NavbarStudent'
import ProfileHeader from '../ProfileHeader'

const StudentLayout = () => {
  const location = useLocation();
  const [label, setLabel] = useState('');

  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const extractedLabel = pathParts[2]; 
    setLabel(extractedLabel);
  }, [location]);

  return (
    <div className="flex w-full bg-secondary ">
    <SideBar /> {/* Example: Admin sidebar */}
    <main className="flex-1 ml-20 ">
      <ProfileHeader label={label}/>
      <div className="relative min-h-main mt-20 sm:mt-[5.5rem] px-2 py-5 sm:px-4  sm:py-10 container mx-auto">
        <Outlet /> {/* This is where nested routes will be rendered */}
      </div>
    </main>
  </div>
  )
}

export default StudentLayout
