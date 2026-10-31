import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import useAuthStore from '../../store/authStore';

const MasterAdminLayout = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // ✅ 1. Pehle store se user check karein, agar nahi mile toh localStorage se nikalein
    const localUser = JSON.parse(localStorage.getItem('user'));
    const currentUser = user || localUser;

    // ✅ 2. Check karein ke user Master Admin ya Demo hai ya nahi
    const isAllowed = currentUser?.role === 'super_admin' || currentUser?.isDemo || currentUser?.role === 'demo';

    if (!isAllowed) {
      // Agar allowed nahi hai, toh seedha normal login page par bhej dein
      navigate('/login');
    } else {
      // Agar allowed hai, toh render hone dein
      setIsChecking(false);
    }
  }, [user, navigate]);

  // ✅ 3. Jab tak check chal raha hai, tab tak ek Loading screen dikhayein
  if (isChecking) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#1e1b4b] text-white">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold tracking-widest uppercase text-sm">Verifying Master Access...</p>
      </div>
    );
  }

  // ✅ 4. Agar sab theek hai, toh Master Layout render karein
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet /> {/* Yahan aapke pages (Overview, Clients etc.) render honge */}
        </main>
      </div>
    </div>
  );
};

export default MasterAdminLayout;