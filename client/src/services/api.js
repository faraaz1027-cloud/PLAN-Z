import axios from 'axios';

// Create an Axios instance
const API = axios.create({
  // Vite injects VITE_API_URL at build time (for example,
  // https://your-backend.onrender.com/api). Local dev retains localhost.
  baseURL: (
    import.meta.env.VITE_API_URL ||
    (import.meta.env.VITE_API_ORIGIN
      ? `${import.meta.env.VITE_API_ORIGIN.replace(/\/$/, '')}/api`
      : 'http://localhost:5000/api')
  ).replace(/\/$/, ''),
});

// Add a request interceptor to attach the JWT token
API.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
