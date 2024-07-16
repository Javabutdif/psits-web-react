import { useEffect, useState} from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SideBar from '../common/navbar/NavbarAdmin';
import ProfileHeader from '../ProfileHeader';

const AdminLayout = () => {
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
      <main className="flex-1 ml-20   ">
        <ProfileHeader label={label}/>
        <div className="relative min-h-main mt-14 sm:mt-20">
          <Outlet /> {/* This is where nested routes will be rendered */}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
