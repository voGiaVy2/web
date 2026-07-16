import api from './api';

const createBooking = (data) => api.post('/bookings', data).then((r) => r.data);
const getMyBookings = () => api.get('/bookings/me').then((r) => r.data);
const getAllBookings = (status) => api.get('/bookings', { params: status ? { status } : {} }).then((r) => r.data);
const updateBookingStatus = (id, status) => api.put(`/bookings/${id}/status`, { status }).then((r) => r.data);

export default { createBooking, getMyBookings, getAllBookings, updateBookingStatus };
