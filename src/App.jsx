import { useEffect } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// 🚨 NAYA: Language Provider Import
import { LanguageProvider } from './context/LanguageContext'; 

// --- PAGES IMPORT ---
import LandingPage from './features/landing/LandingPage';
import LoginPage from './features/auth/LoginPage';
import Signup from './features/auth/Signup';                 
import ForgotPassword from './features/auth/ForgotPassword'; 
import ResetPassword from './features/auth/ResetPassword';    

import PosLayout from './app/layouts/PosLayout';
import PosTerminal from './features/pos/PosTerminal';
import Dashboard from './features/dashboard/Dashboard';
import Inventory from './features/inventory/Inventory';
import Products from './features/products/Products';
import Categories from './features/categories/Categories';
import Customers from './features/customers/Customers';
import Settings from './features/settings/Settings';
import Orders from './features/orders/orders';
import Branches from './features/branches/branches';
import StockTransfer from './features/inventory/StockTransfer';
import Reports from './features/reports/Reports';
import Team from './features/team/Team';       
import Support from './features/support/Support'; 
import PurchaseOrders from './features/purchase/PurchaseOrders'; 
import ActivityLogs from './features/team/ActivityLogs'; 

// 🚨 NAYA: Master Admin Routes Import
import MasterAdminRoutes from './features/master-admin/MasterAdminRoutes';

const Payments = () => <div className="p-8"><h1 className="text-2xl font-bold">Payments Module</h1><p className="text-slate-500 mt-2">Coming Soon...</p></div>;

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem('storeSettings'));
    if (savedSettings?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <LanguageProvider>
      <Router>
        <Toaster 
          position="top-right" 
          toastOptions={{ 
            style: { 
              background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#fff', 
              color: document.documentElement.classList.contains('dark') ? '#fff' : '#1e293b' 
            } 
          }} 
        />
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* 🚨 NAYA: HIDDEN MASTER ADMIN ROUTE */}
          <Route 
            path="/secret-master-control/*" 
            element={
              <ProtectedRoute>
                <MasterAdminRoutes />
              </ProtectedRoute>
            } 
          />

          {/* PROTECTED ROUTES (Normal POS System) */}
          <Route 
            path="/app" 
            element={
              <ProtectedRoute>
                <PosLayout />
              </ProtectedRoute>
            } 
          >
            <Route index element={<Navigate to="/app/pos" replace />} />
            
            <Route path="pos" element={<PosTerminal />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="customers" element={<Customers />} />
            <Route path="orders" element={<Orders />} />
            <Route path="settings" element={<Settings />} />
            <Route path="team" element={<Team />} />
            <Route path="support" element={<Support />} />
            <Route path="branches" element={<Branches />} />
            <Route path="stock-transfer" element={<StockTransfer />} />
            <Route path="purchases" element={<PurchaseOrders />} />
            <Route path="activity-logs" element={<ActivityLogs />} />
            <Route path="payments" element={<Payments />} />
            <Route path="reports" element={<Reports />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;