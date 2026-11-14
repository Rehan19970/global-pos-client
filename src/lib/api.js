import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', 
  withCredentials: true,
});

// Request Interceptor: Har request ke sath Token bhejna
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling (Professional Style)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    
    // Auth requests aur Master Admin requests ke liye alag handle
    const isAuthRequest = url?.includes('/auth/login') || url?.includes('/auth/register');
    const isMasterRequest = url?.includes('/master-admin');
    const isMasterUser = JSON.parse(localStorage.getItem('user'))?.role === 'super_admin';

    // ✅ 401 Session Expired Handling
    if (status === 401 && !isAuthRequest && !isMasterRequest && !isMasterUser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      
      toast.error('Session expired. Please login again.', {
        duration: 4000,
        style: { 
          background: '#fef2f2', 
          color: '#b91c1c', 
          border: '1px solid #fecaca',
          fontWeight: 'bold',
          borderRadius: '12px'
        },
        iconTheme: { primary: '#ef4444', secondary: '#fff' }
      });
    } 
    // ✅ Backend se aane wale errors ko professional toast mein dikhayein
    else if (error.response?.data?.message) {
      toast.error(error.response.data.message, {
        duration: 4000,
        style: { 
          background: '#fef2f2', 
          color: '#b91c1c', 
          border: '1px solid #fecaca',
          fontWeight: 'bold',
          borderRadius: '12px',
          padding: '12px 16px'
        },
        iconTheme: { primary: '#ef4444', secondary: '#fff' }
      });
    } 
    // ✅ Network Error (Server down ya Internet issue)
    else if (error.request) {
      toast.error('Network error! Please check your internet or server connection.', {
        duration: 4000,
        style: { 
          background: '#fef2f2', 
          color: '#b91c1c', 
          border: '1px solid #fecaca',
          fontWeight: 'bold',
          borderRadius: '12px'
        },
        iconTheme: { primary: '#ef4444', secondary: '#fff' }
      });
    } 
    // ✅ Koi aur Unknown Error
    else {
      toast.error('Something went wrong. Please try again.', {
        duration: 4000,
        style: { 
          background: '#fef2f2', 
          color: '#b91c1c', 
          border: '1px solid #fecaca',
          fontWeight: 'bold',
          borderRadius: '12px'
        },
        iconTheme: { primary: '#ef4444', secondary: '#fff' }
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;