import { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Mail, Clock, Play, Square, Shield, Store, 
  Calendar, CheckCircle2, XCircle, Search, Phone, 
  UserCheck, MoreVertical, X, Briefcase, Calculator, Edit, 
  Banknote, TrendingUp, User
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';
import { formatCurrency, getStoreSettings } from '../../lib/formatCurrency';
import { onSettingsUpdated } from '../../lib/currencyEvents';
import useAuthStore from '../../store/authStore';
import { useLanguage } from '../../context/LanguageContext';

const Team = () => {
  const { user, selectedBranch } = useAuthStore(); 
  const { t } = useLanguage();
  
  // ✅ DEMO USER CHECK
  const isDemoUser = user?.isDemo || user?.role === 'demo';

  const [activePage, setActivePage] = useState('staff'); 
  const [staff, setStaff] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [attendance, setAttendance] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [shiftData, setShiftData] = useState({ openingCash: 0, cashierId: '' });
  const [closeShiftData, setCloseShiftData] = useState({ shiftId: '', expected: 0, actual: 0 });
  const [editData, setEditData] = useState({ id: '', name: '', salary: 0, role: '' });

  // ✅ Currency state
  const [storeSettings, setStoreSettings] = useState(getStoreSettings());

  useEffect(() => {
    const unsubscribe = onSettingsUpdated((next) => {
      setStoreSettings(next || getStoreSettings());
    });
    return unsubscribe;
  }, []);

  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', role: 'cashier', phone: '', salary: 0, customRole: '' 
  });

  useEffect(() => {
    if (activePage === 'staff') fetchStaff();
    if (activePage === 'shifts') fetchShifts();
    if (activePage === 'attendance') fetchAttendance();
  }, [activePage, selectedBranch]);

  // ==========================================
  // STAFF & PAYROLL FUNCTIONS
  // ==========================================
  const fetchStaff = async () => {
    try {
      const isAdminLevel = user?.role === 'super_admin' || user?.role === 'store_admin';
      const branchId = selectedBranch || user?.branchId?._id || user?.branchId;
      
      let url = '/auth/users';
      if (isAdminLevel && branchId) url = `/auth/users?branchId=${branchId}`;
      
      const { data } = await api.get(url);
      setStaff(data);
    } catch (error) { toast.error('Failed to load staff'); }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    
    const isAdminLevel = user?.role === 'super_admin' || user?.role === 'store_admin';
    const branchId = selectedBranch || user?.branchId?._id || user?.branchId;
    
    if (isAdminLevel && !branchId) return toast.error('Please select a branch first!');
    
    try {
      const finalRole = formData.role === 'custom' ? formData.customRole.toLowerCase() : formData.role;
      const payload = { ...formData, role: finalRole, ...(isAdminLevel && branchId ? { branchId } : {}) };
      await api.post('/auth/register', payload);
      toast.success('Team member added!');
      setIsStaffModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'cashier', phone: '', salary: 0, customRole: '' });
      fetchStaff();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to add staff'); }
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/auth/users/${editData.id}`, editData);
      toast.success('Staff details updated!');
      setIsEditModalOpen(false);
      fetchStaff();
    } catch (error) { toast.error('Failed to update staff'); }
  };

  const handlePaySalary = async (id, name) => {
    if(window.confirm(`${t('confirmSalary')} ${name}?`)) {
      try {
        await api.post(`/auth/users/${id}/pay-salary`);
        toast.success(`${t('salaryPaid')} ${name}!`);
        fetchStaff();
      } catch (error) {
        toast.error('Failed to pay salary');
      }
    }
  };

  const calculateSalary = (baseSalary, absentDays) => {
    if (!baseSalary) return 0;
    const perDaySalary = baseSalary / 30; 
    return Math.max(0, baseSalary - (perDaySalary * absentDays));
  };

  const openProfile = async (member) => {
    try {
      const { data } = await api.get(`/auth/users/${member._id}/profile`);
      setSelectedProfile(data.user);
      setIsProfileModalOpen(true);
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  // ==========================================
  // ATTENDANCE FUNCTIONS
  // ==========================================
  const fetchAttendance = async () => {
    try {
      const isAdminLevel = user?.role === 'super_admin' || user?.role === 'store_admin';
      const branchId = selectedBranch || user?.branchId?._id || user?.branchId;
      
      let url = '/attendance';
      if (isAdminLevel && branchId) url = `/attendance?branchId=${branchId}`;
      
      const { data } = await api.get(url);
      setAttendance(data);
    } catch (error) { toast.error('Failed to load attendance'); }
  };

  const handleMarkAttendance = async (staffId, status) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    try {
      await api.post('/attendance/mark', { 
        staffId, 
        status, 
        clockIn: status === 'Present' ? time : '-',
        clockOut: '-' 
      });
      toast.success(`${t('markedAs')} ${status}!`);
      fetchAttendance();
    } catch (error) { toast.error('Failed to mark attendance'); }
  };

  const handleClockOut = async (staffId) => {
    try {
      await api.post('/attendance/clock-out', { staffId });
      toast.success('Clock Out successful!');
      fetchAttendance();
    } catch (error) { toast.error('Failed to clock out'); }
  };

  // ==========================================
  // SHIFT FUNCTIONS
  // ==========================================
  const fetchShifts = async () => {
    try {
      const isAdminLevel = user?.role === 'super_admin' || user?.role === 'store_admin';
      const branchId = selectedBranch || user?.branchId?._id || user?.branchId;
      
      let url = '/shifts';
      if (isAdminLevel && branchId) url = `/shifts?branchId=${branchId}`;
      
      const { data } = await api.get(url);
      setShifts(data);
    } catch (error) { toast.error('Failed to load shifts'); }
  };

  const handleOpenShift = async (e) => {
    e.preventDefault();
    if (!shiftData.cashierId) return toast.error(t('selectCashier'));
    
    const isAdminLevel = user?.role === 'super_admin' || user?.role === 'store_admin';
    const branchId = selectedBranch || user?.branchId?._id || user?.branchId;
    
    try {
      const payload = { 
        openingCash: Number(shiftData.openingCash), 
        branchId: isAdminLevel ? branchId : undefined, 
        cashierId: shiftData.cashierId 
      };
      await api.post('/shifts/open', payload);
      toast.success(t('shiftStarted'));
      setIsShiftModalOpen(false);
      fetchShifts();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const handlePreCloseShift = (shift) => {
    const expected = shift.openingCash + shift.totalSales;
    setCloseShiftData({ shiftId: shift._id, expected: expected, actual: expected });
    setIsCloseShiftModalOpen(true);
  };

  const handleCloseShift = async (e) => {
    e.preventDefault();
    try {
      await api.post('/shifts/close', { closingCash: Number(closeShiftData.actual), shiftId: closeShiftData.shiftId });
      toast.success(t('shiftClosed'));
      setIsCloseShiftModalOpen(false);
      fetchShifts();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const formatTime = (start, end) => {
    const s = new Date(start);
    const e = end ? new Date(end) : new Date();
    const hrs = Math.floor((e - s) / 3600000);
    const mins = Math.floor(((e - s) % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
  };

  const fmt = (value) => formatCurrency(value, { settings: storeSettings });

  return (
    <div className="p-8 h-full overflow-y-auto bg-[#f8fafc]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3"><Users className="text-teal-600" /> {t('hrPayroll')}</h1>
          <p className="text-slate-500 mt-1">{t('manageStaff')}</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {activePage === 'staff' && (
            <button onClick={() => setIsStaffModalOpen(true)} className="flex items-center gap-2 bg-[#0f766e] hover:bg-[#115e59] text-white px-5 py-2.5 rounded-xl shadow-md transition text-sm font-bold">
              <UserPlus size={18} /> {t('addEmployee')}
            </button>
          )}
          
          {/* ✅ DEMO USER KE LIYE SHIFT START BUTTON HIDE */}
          {activePage === 'shifts' && !isDemoUser && (
            <button onClick={() => { setShiftData({ openingCash: 0, cashierId: '' }); setIsShiftModalOpen(true); }} className="flex items-center gap-2 bg-[#0f766e] hover:bg-[#115e59] text-white px-5 py-2.5 rounded-xl shadow-md transition text-sm font-bold">
              <Play size={18} /> {t('startShift')}
            </button>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button onClick={() => setActivePage('staff')} className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${activePage === 'staff' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500'}`}>{t('staffPayroll')}</button>
        <button onClick={() => setActivePage('attendance')} className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${activePage === 'attendance' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500'}`}>{t('dailyAttendance')}</button>
        <button onClick={() => setActivePage('shifts')} className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${activePage === 'shifts' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500'}`}>{t('cashierShifts')}</button>
      </div>

      {/* ================= TAB 1: STAFF & PAYROLL ================= */}
      {activePage === 'staff' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input type="text" placeholder={t('search')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>

          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-100">
              <tr>
                <th className="p-4 font-bold pl-6">{t('employee')}</th>
                <th className="p-4 font-bold">{t('role')}</th>
                <th className="p-4 font-bold">{t('baseSalary')}</th>
                <th className="p-4 font-bold">{t('netPayable')}</th>
                <th className="p-4 font-bold">{t('status')}</th>
                <th className="p-4 font-bold text-center">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((member) => {
                const absentDays = 1; 
                const netSalary = calculateSalary(member.salary, absentDays);

                return (
                  <tr key={member._id} className="hover:bg-slate-50 transition">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => openProfile(member)}>
                        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg group-hover:bg-teal-600 group-hover:text-white transition">{member.name.charAt(0)}</div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm group-hover:text-teal-600 group-hover:underline">{member.name}</p>
                          <p className="text-xs text-slate-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><span className="px-2 py-1 rounded bg-orange-100 text-orange-700 text-[10px] font-bold uppercase">{member.role}</span></td>
                    <td className="p-4 font-medium text-slate-600">{fmt(member.salary || 0)}</td>
                    <td className="p-4">
                      <p className="font-bold text-green-600 text-lg">{fmt(netSalary)}</p>
                      <p className="text-[10px] text-red-500">{absentDays} {t('dayAbsentDeduction')}</p>
                    </td>
                    <td className="p-4">
                       <button onClick={() => handlePaySalary(member._id, member.name)} className="flex items-center gap-1.5 text-xs font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 transition">
                         <Banknote size={14}/> {t('paySalary')}
                       </button>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => { setEditData({ id: member._id, name: member.name, salary: member.salary, role: member.role }); setIsEditModalOpen(true); }} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition">
                        <MoreVertical size={18}/>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= TAB 2: ATTENDANCE ================= */}
      {activePage === 'attendance' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-100">
              <tr>
                <th className="p-4 font-bold pl-6">{t('employee')}</th>
                <th className="p-4 font-bold">{t('clockIn')}</th>
                <th className="p-4 font-bold">{t('clockOut')}</th>
                <th className="p-4 font-bold">{t('status')}</th>
                <th className="p-4 font-bold text-center">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((member) => {
                const record = attendance.find(a => a.staffId?._id === member._id) || { status: 'Not Marked', clockIn: '-', clockOut: '-' };
                return (
                  <tr key={member._id} className="hover:bg-slate-50">
                    <td className="p-4 pl-6"><p className="font-bold text-sm text-slate-800">{member.name}</p></td>
                    <td className="p-4 text-sm font-medium text-slate-600">{record.clockIn}</td>
                    <td className="p-4 text-sm font-medium text-slate-600">{record.clockOut}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${record.status === 'Present' ? 'bg-green-100 text-green-700' : record.status === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>{record.status}</span>
                    </td>
                    <td className="p-4 text-center flex justify-center gap-2">
                      {record.status === 'Not Marked' ? (
                        <>
                          <button onClick={() => handleMarkAttendance(member._id, 'Present')} className="bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-xs font-bold" title="Present"><UserCheck size={14}/> {t('in')}</button>
                          <button onClick={() => handleMarkAttendance(member._id, 'Absent')} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold" title="Absent"><XCircle size={14}/> {t('absent')}</button>
                        </>
                      ) : record.status === 'Present' && record.clockOut === '-' ? (
                        <button onClick={() => handleClockOut(member._id)} className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Clock size={14}/> {t('clockOut')}</button>
                      ) : (
                        <span className="text-xs text-slate-400 font-bold">{t('completed')}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= TAB 3: SHIFTS ================= */}
      {activePage === 'shifts' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-100">
              <tr>
                <th className="p-4 font-bold pl-6">{t('cashier')}</th>
                <th className="p-4 font-bold">{t('duration')}</th>
                <th className="p-4 font-bold">{t('openingCash')}</th>
                <th className="p-4 font-bold">{t('totalSales')}</th>
                <th className="p-4 font-bold">{t('status')}</th>
                <th className="p-4 font-bold text-center">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shifts.map((shift) => (
                <tr key={shift._id} className="hover:bg-slate-50 transition">
                  <td className="p-4 pl-6"><p className="font-bold text-slate-900 text-sm">{shift.cashierId?.name || 'Unknown'}</p></td>
                  <td className="p-4 text-sm text-slate-600 font-medium">{formatTime(shift.startTime, shift.endTime)}</td>
                  <td className="p-4 text-sm font-medium text-slate-800">{fmt(shift.openingCash)}</td>
                  <td className="p-4 text-sm font-bold text-teal-600">{fmt(shift.totalSales)}</td>
                  <td className="p-4">
                    {shift.status === 'Open' ? (
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold flex items-center gap-1 w-fit"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> {t('active')}</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-bold w-fit">{t('closed')}</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {shift.status === 'Open' && (
                      <button onClick={() => handlePreCloseShift(shift)} className="flex items-center gap-1 mx-auto bg-red-50 hover:bg-red-100 text-red-600 px-4 py-1.5 rounded-lg text-xs font-bold transition"><Square size={12} /> {t('close')}</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* 1. EMPLOYEE PROFILE MODAL */}
      {isProfileModalOpen && selectedProfile && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="h-32 bg-teal-600 relative">
               <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-full"><X size={20} /></button>
               <div className="absolute -bottom-10 left-8">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-black text-teal-600 border-4 border-white shadow-lg">{selectedProfile.name.charAt(0)}</div>
               </div>
            </div>
            
            <div className="pt-14 px-8 pb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedProfile.name}</h2>
                  <p className="text-slate-500 flex items-center gap-2"><Shield size={14}/> {selectedProfile.role} • <Store size={14}/> {selectedProfile.branchId?.name || 'Global'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">{t('currentSalary')}</p>
                  <p className="text-xl font-bold text-teal-600">{fmt(selectedProfile.salary)}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">{t('thisWeek')}</p>
                  <p className="text-2xl font-black text-slate-800">5 <span className="text-sm font-medium text-slate-500">{t('days')}</span></p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">{t('thisMonth')}</p>
                  <p className="text-2xl font-black text-slate-800">22 <span className="text-sm font-medium text-slate-500">{t('days')}</span></p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                  <p className="text-xs text-red-500 font-bold uppercase mb-1">{t('absentsMonth')}</p>
                  <p className="text-2xl font-black text-red-600">1 <span className="text-sm font-medium text-red-400">{t('day')}</span></p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setIsProfileModalOpen(false)} className="w-full py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition">{t('closeProfile')}</button>
                <button onClick={() => handlePaySalary(selectedProfile._id, selectedProfile.name)} className="w-full py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition flex items-center justify-center gap-2"><Banknote size={18}/> {t('payFullSalary')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. START SHIFT MODAL */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">{t('startNewShift')}</h2>
              <button onClick={() => setIsShiftModalOpen(false)} className="text-slate-400 hover:text-slate-800"><X size={20} /></button>
            </div>
            <form onSubmit={handleOpenShift} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('whoStartingShift')} *</label>
                <select required value={shiftData.cashierId} onChange={e => setShiftData({...shiftData, cashierId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">{t('selectCashier')}</option>
                  {staff.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('openingCashAmount')} * <span className="text-xs text-slate-500">— PKR</span>
                </label>
                <input type="number" min="0" required value={shiftData.openingCash} onChange={e => setShiftData({...shiftData, openingCash: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-lg font-bold" placeholder="0.00" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsShiftModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100">{t('cancel')}</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-[#0f766e] hover:bg-[#115e59] flex items-center justify-center gap-2"><Play size={16}/> {t('start')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. CLOSE SHIFT MODAL */}
      {isCloseShiftModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">{t('closeShiftMatchCash')}</h2>
              <button onClick={() => setIsCloseShiftModalOpen(false)} className="text-slate-400 hover:text-slate-800"><X size={20} /></button>
            </div>
            <form onSubmit={handleCloseShift} className="p-6 space-y-5">
              <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-teal-800">{t('expectedCashInDrawer')}</p>
                  <p className="text-xs text-teal-600">({t('openingPlusCashSales')})</p>
                </div>
                <p className="text-xl font-black text-teal-700">{fmt(closeShiftData.expected)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('actualCashCounted')} * <span className="text-xs text-slate-500">— PKR</span>
                </label>
                <input type="number" required value={closeShiftData.actual} onChange={e => setCloseShiftData({...closeShiftData, actual: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 text-xl font-bold" />
              </div>

              <div className={`p-3 rounded-xl text-sm font-bold flex items-center justify-between ${closeShiftData.actual - closeShiftData.expected === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                <span>{t('difference')}:</span>
                <span>{fmt(closeShiftData.actual - closeShiftData.expected)}</span>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsCloseShiftModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100">{t('cancel')}</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-[#0f766e] hover:bg-[#115e59]">{t('confirmClose')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. EDIT STAFF MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">{t('editStaffDetails')}</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-800"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('fullName')}</label>
                <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('monthlySalary')} <span className="text-xs text-slate-500">— PKR</span>
                </label>
                <input type="number" value={editData.salary} onChange={e => setEditData({...editData, salary: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('role')}</label>
                <select value={editData.role} onChange={e => setEditData({...editData, role: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none">
                  <option value="manager">{t('manager')}</option>
                  <option value="cashier">{t('cashier')}</option>
                  <option value="helper">{t('helper')}</option>
                  <option value="security">{t('security')}</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                               <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100">{t('cancel')}</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-teal-600">{t('update')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. ADD STAFF MODAL */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">{t('addNewEmployee')}</h2>
              <button onClick={() => setIsStaffModalOpen(false)} className="text-slate-400 hover:text-slate-800"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="staffForm" onSubmit={handleAddStaff} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('fullName')} *</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g. Ali Raza" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('email')} *</label>
                    <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none" placeholder="ali@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('password')} *</label>
                    <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('phoneNo')}</label>
                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none" placeholder="03xx-xxxxxxx" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('monthlySalary')} <span className="text-xs text-slate-500">— PKR</span>
                    </label>
                    <input type="number" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none" placeholder="e.g. 50000" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('assignRole')} *</label>
                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none">
                      <option value="cashier">{t('cashierPosSales')}</option>
                      <option value="manager">{t('storeManager')}</option>
                      <option value="helper">{t('storeHelper')}</option>
                      <option value="security">{t('securityGuard')}</option>
                      <option value="custom">+ {t('addCustomRole')}</option>
                    </select>
                  </div>
                  {formData.role === 'custom' && (
                    <div className="col-span-2 bg-teal-50 p-3 rounded-xl border border-teal-100 flex items-center gap-2">
                      <Briefcase size={16} className="text-teal-600"/>
                      <input type="text" required value={formData.customRole} onChange={e => setFormData({...formData, customRole: e.target.value})} className="w-full bg-white border border-teal-200 rounded-lg px-3 py-2 text-sm outline-none" placeholder={t('typeCustomRole')} />
                    </div>
                  )}
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setIsStaffModalOpen(false)} type="button" className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200">{t('cancel')}</button>
              <button type="submit" form="staffForm" className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#0f766e] hover:bg-[#115e59]">{t('saveEmployee')}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Team;