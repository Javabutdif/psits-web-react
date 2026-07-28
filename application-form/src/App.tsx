// src/App.tsx

import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { PublicRoute, StudentRoute, AdminRoute } from './routes/guards';

// Pages
import PublicLanding from './pages/public/landing';
import PublicPositionDetails from './pages/public/details';
import Login from './pages/auth/Login';
import StudentApply from './pages/student/apply';
import StudentPreview from './pages/student/preview';
import StudentDashboard from './pages/student/dashboard';
import StudentApplicationDetails from './pages/student/details';
import AdminDashboard from './pages/admin/dashboard';
import AdminPositionsList from './pages/admin/positions/list';
import AdminPositionsForm from './pages/admin/positions/form';
import AdminApplicantsList from './pages/admin/applicants/list';
import AdminApplicantDetails from './pages/admin/applicants/detail';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<PublicLayout><PublicRoute><PublicLanding /></PublicRoute></PublicLayout>} />
        <Route
          path="/position/:id"
          element={<PublicLayout><PublicRoute><PublicPositionDetails /></PublicRoute></PublicLayout>}
        />
        <Route path="/login" element={<Login />} />

        <Route
          path="/apply/:positionId"
          element={<StudentLayout><StudentRoute><StudentApply /></StudentRoute></StudentLayout>}
        />
        <Route
          path="/preview"
          element={<StudentLayout><StudentRoute><StudentPreview /></StudentRoute></StudentLayout>}
        />
        <Route
          path="/applications"
          element={<StudentLayout><StudentRoute><StudentDashboard /></StudentRoute></StudentLayout>}
        />
        <Route
          path="/application/:id"
          element={<StudentLayout><StudentRoute><StudentApplicationDetails /></StudentRoute></StudentLayout>}
        />

        <Route
          path="/admin"
          element={<AdminLayout><AdminRoute><AdminDashboard /></AdminRoute></AdminLayout>}
        />
        <Route
          path="/admin/positions"
          element={<AdminLayout><AdminRoute><AdminPositionsList /></AdminRoute></AdminLayout>}
        />
        <Route
          path="/admin/positions/new"
          element={<AdminLayout><AdminRoute><AdminPositionsForm /></AdminRoute></AdminLayout>}
        />
        <Route
          path="/admin/positions/edit/:id"
          element={<AdminLayout><AdminRoute><AdminPositionsForm /></AdminRoute></AdminLayout>}
        />
        <Route
          path="/admin/applicants"
          element={<AdminLayout><AdminRoute><AdminApplicantsList /></AdminRoute></AdminLayout>}
        />
        <Route
          path="/admin/application/:id"
          element={<AdminLayout><AdminRoute><AdminApplicantDetails /></AdminRoute></AdminLayout>}
        />

        <Route
          path="*"
          element={<PublicLayout><PublicRoute><div className="py-16 text-center text-gray-600">Page not found</div></PublicRoute></PublicLayout>}
        />
      </Routes>
      <Toaster position="top-right" richColors closeButton />
    </>
  );
};

export default App;
