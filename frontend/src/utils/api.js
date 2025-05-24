import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    const message = error.response?.data?.error || 'An error occurred';
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      window.location.href = '/unauthorized';
    }
    // Handle forbidden errors
    else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action');
    }
    // Handle other errors
    else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 