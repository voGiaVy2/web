import api from './api';

const getRooms = (params) => {
  // Loại bỏ các tham số rỗng/undefined trước khi gửi, tránh trường hợp
  // backend validate nhầm giá trị rỗng thành "sai định dạng".
  const clean = {};
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== '' && v !== undefined && v !== null) clean[k] = v;
  });
  return api.get('/rooms', { params: clean }).then((r) => r.data);
};
const getRoomById = (id) => api.get(`/rooms/${id}`).then((r) => r.data);
const createRoom = (data) => api.post('/rooms', data).then((r) => r.data);
const updateRoom = (id, data) => api.put(`/rooms/${id}`, data).then((r) => r.data);
const deleteRoom = (id) => api.delete(`/rooms/${id}`).then((r) => r.data);
const getCategories = () => api.get('/categories').then((r) => r.data);

export default { getRooms, getRoomById, createRoom, updateRoom, deleteRoom, getCategories };