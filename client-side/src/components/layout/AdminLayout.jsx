import { Outlet } from 'react-router-dom';
import Navbar from '../common/NavbarAdmin';

const AdminLayout = () => {
  return (
    <div>
      <Navbar /> {/* Example: Admin navbar */}
      <main>
        <Outlet /> {/* This is where nested routes will be rendered */}
      </main>
    </div>
  );
};

export default AdminLayout;
