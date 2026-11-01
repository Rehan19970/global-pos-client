import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react'; // ✅ Mobile Menu ke liye icon
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import useAuthStore from '../../store/authStore';

const MasterAdminLayout = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // ✅ Mobile Menu State

  useEffect(() => {
    // ✅ 1. Pehle store se user check karein, agar nahi mile toh localStorage se nikalein
    const localUser = JSON.parse(localStorage.getItem('user'));
    const currentUser = user || localUser;

    // ✅ 2. Check karein ke user Master Admin ya Demo hai ya nahi
    const isAllowed = currentUser?.role === 'super_admin' || currentUser?.isDemo || currentUser?.role === 'demo';

    if (!isAllowed) {
      navigate('/login');
    } else {
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
      
      {/* Sidebar (Mobile par props receive karega) */}
      <Sidebar 
        isMobileOpen={isMobileMenuOpen} 
        closeMobileMenu={() => setIsMobileMenuOpen(false)} 
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* ✅ Mobile Top Bar (Sirf mobile par nazar aayega) */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className="p-1.5 -ml-1 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h2 className="font-bold text-slate-800 text-lg">Master Admin</h2>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
            {user?.name?.charAt(0) || 'M'}
          </div>
        </div>

        {/* Desktop Topbar (Mobile par yeh chhup jayega kyunke upar wala mobile bar aa gaya) */}
        <div className="hidden lg:block">
          <Topbar />
        </div>

        <main className="flex-1 overflow-y-auto p-3 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MasterAdminLayout;