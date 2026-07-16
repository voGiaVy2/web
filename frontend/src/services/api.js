import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  // Render free tier có thể "ngủ" sau 15 phút không dùng, lần gọi đầu tiên
  // sau khi ngủ có thể mất 30-50s để khởi động lại -> tăng timeout để tránh
  // báo lỗi oan khi server chỉ đang "thức dậy".
  timeout: 60000,
});

// Tự động đính kèm JWT token vào mọi request nếu đã đăng nhập
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Nếu token hết hạn / không hợp lệ -> tự động đăng xuất
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
