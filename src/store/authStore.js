import { create } from 'zustand';
import api from '../lib/api';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isLoading: false,

  // Global Selected Branch (Super Admin ke liye)
  selectedBranch: localStorage.getItem('selectedBranch') || '',

  // Branch change karne ka function
  setSelectedBranch: (branchId) => {
    if (branchId) {
      localStorage.setItem('selectedBranch', branchId);
    } else {
      localStorage.removeItem('selectedBranch');
    }
    set({ selectedBranch: branchId });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // ✅ FIX: Check karein ke user data kahan hai
      // Agar Master Admin hai, toh data.user mein hoga. Agar normal hai, toh poore data mein hoga.
      const userData = response.data.user || response.data;
      const tokenData = response.data.token;

      localStorage.setItem('token', tokenData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      localStorage.removeItem('selectedBranch');

      set({ user: userData, token: tokenData, selectedBranch: '', isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedBranch');
    set({ user: null, token: null, selectedBranch: '' });
  },
}));

export default useAuthStore;