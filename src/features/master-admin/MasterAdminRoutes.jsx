import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import MasterAdminLayout from './MasterAdminLayout';
import Overview from './pages/Overview';
import Clients from './pages/Clients';
import Plans from './pages/Plans';
import Subscriptions from './pages/Subscriptions';
import Settings from './pages/Settings';
import useAuthStore from '../../store/authStore';
import ClientProfile from './pages/ClientProfile'; // ✅ Import

// ✅ Protected Route Component 
const MasterProtectedRoute = () => {
  const { token, user } = useAuthStore();
  
  // Agar token nahi hai ya user Super Admin/Demo nahi hai, toh normal login par bhej do
  const isAllowed = user?.role === 'super_admin' || user?.isDemo || user?.role === 'demo';

  if (!token || !isAllowed) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

const MasterAdminRoutes = () => {
  return (
    <Routes>
      {/* Protected Layout (Login ke baad hi khulega) */}
      <Route element={<MasterProtectedRoute />}>
        <Route path="/" element={<MasterAdminLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="clients" element={<Clients />} />
          <Route path="plans" element={<Plans />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="settings" element={<Settings />} />
          <Route path="clients/:id" element={<ClientProfile />} />

        </Route>
      </Route>
    </Routes>
  );
};

export default MasterAdminRoutes;