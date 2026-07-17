import api from './api';

const getUsers = () => api.get('/admin/users').then((r) => r.data);
const updateUserRole = (id, role) => api.put(`/admin/users/${id}/role`, { role }).then((r) => r.data);
const getStats = () => api.get('/admin/stats').then((r) => r.data);
const getAllRooms = () => api.get('/admin/rooms').then((r) => r.data);

export default { getUsers, updateUserRole, getStats, getAllRooms };
