import api from './api';

const register = (data) => api.post('/auth/register', data).then((r) => r.data);
const login = (data) => api.post('/auth/login', data).then((r) => r.data);
const forgotPassword = (email) => api.post('/auth/forgot-password', { email }).then((r) => r.data);
const resetPassword = (token, password) => api.post('/auth/reset-password', { token, password }).then((r) => r.data);
const changePassword = (currentPassword, newPassword) =>
  api.post('/auth/change-password', { currentPassword, newPassword }).then((r) => r.data);
const verifyEmail = (token) => api.get(`/auth/verify-email?token=${token}`).then((r) => r.data);
const getMe = () => api.get('/auth/me').then((r) => r.data);

export default { register, login, forgotPassword, resetPassword, changePassword, verifyEmail, getMe };
