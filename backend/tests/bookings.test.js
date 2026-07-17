const request = require('supertest');

jest.mock('../src/config/prisma', () => require('./helpers/prismaMock'));
jest.mock('../src/utils/mailer', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue({ simulated: true }),
  sendResetPasswordEmail: jest.fn().mockResolvedValue({ simulated: true }),
}));

const prismaMock = require('./helpers/prismaMock');
const app = require('../src/app');
const { signAccessToken } = require('../src/utils/jwt');

const tokenFor = (id, role) => signAccessToken({ id, role });

describe('Booking API', () => {
  beforeEach(() => {
    prismaMock.resetPrismaMock();
  });

  describe('POST /api/bookings', () => {
    it('trả về 401 khi chưa đăng nhập', async () => {
      const res = await request(app).post('/api/bookings').send({ roomId: 1, fromDate: '2026-08-01', toDate: '2026-08-02' });
      expect(res.status).toBe(401);
    });

    it('trả về 404 khi phòng không tồn tại', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: 1, role: 'USER' });
      prismaMock.room.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${tokenFor(1, 'USER')}`)
        .send({ roomId: 999, fromDate: '2026-08-01', toDate: '2026-08-02' });

      expect(res.status).toBe(404);
    });

    it('trả về 400 khi phòng hiện không khả dụng', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: 1, role: 'USER' });
      prismaMock.room.findUnique.mockResolvedValueOnce({ id: 1, isAvailable: false });

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${tokenFor(1, 'USER')}`)
        .send({ roomId: 1, fromDate: '2026-08-01', toDate: '2026-08-02' });

      expect(res.status).toBe(400);
    });

    it('trả về 400 khi fromDate >= toDate', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: 1, role: 'USER' });
      prismaMock.room.findUnique.mockResolvedValueOnce({ id: 1, isAvailable: true });

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${tokenFor(1, 'USER')}`)
        .send({ roomId: 1, fromDate: '2026-08-05', toDate: '2026-08-01' });

      expect(res.status).toBe(400);
    });

    it('tạo booking thành công khi dữ liệu hợp lệ', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: 1, role: 'USER' });
      prismaMock.room.findUnique.mockResolvedValueOnce({ id: 1, isAvailable: true });
      prismaMock.booking.create.mockResolvedValueOnce({
        id: 1, userId: 1, roomId: 1, status: 'PENDING',
      });

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${tokenFor(1, 'USER')}`)
        .send({ roomId: 1, fromDate: '2026-08-01', toDate: '2026-08-02' });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('PENDING');
    });
  });

  describe('PUT /api/bookings/:id/cancel (tự huỷ đơn của mình)', () => {
    it('trả về 404 khi đơn không tồn tại', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: 1, role: 'USER' });
      prismaMock.booking.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/bookings/999/cancel')
        .set('Authorization', `Bearer ${tokenFor(1, 'USER')}`);

      expect(res.status).toBe(404);
    });

    it('CHỐNG IDOR: trả về 403 khi user cố huỷ đơn của người KHÁC', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: 1, role: 'USER' });
      prismaMock.booking.findUnique.mockResolvedValueOnce({
        id: 5, userId: 2, roomId: 1, status: 'PENDING', // đơn thuộc về userId=2
      });

      const res = await request(app)
        .put('/api/bookings/5/cancel')
        .set('Authorization', `Bearer ${tokenFor(1, 'USER')}`); // nhưng user đăng nhập là id=1

      expect(res.status).toBe(403);
    });

    it('trả về 400 khi đơn đã CANCELLED/COMPLETED (không huỷ lại được)', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: 1, role: 'USER' });
      prismaMock.booking.findUnique.mockResolvedValueOnce({
        id: 5, userId: 1, roomId: 1, status: 'COMPLETED',
      });

      const res = await request(app)
        .put('/api/bookings/5/cancel')
        .set('Authorization', `Bearer ${tokenFor(1, 'USER')}`);

      expect(res.status).toBe(400);
    });

    it('chủ đơn huỷ thành công đơn PENDING của chính mình và phòng được mở lại', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: 1, role: 'USER' });
      prismaMock.booking.findUnique.mockResolvedValueOnce({
        id: 5, userId: 1, roomId: 10, status: 'PENDING',
      });
      prismaMock.booking.update.mockResolvedValueOnce({ id: 5, status: 'CANCELLED' });
      prismaMock.booking.count.mockResolvedValueOnce(0); // không còn đơn active nào khác
      prismaMock.room.update.mockResolvedValueOnce({ id: 10, isAvailable: true });

      const res = await request(app)
        .put('/api/bookings/5/cancel')
        .set('Authorization', `Bearer ${tokenFor(1, 'USER')}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CANCELLED');
      expect(prismaMock.room.update).toHaveBeenCalledWith({ where: { id: 10 }, data: { isAvailable: true } });
    });
  });

  describe('PUT /api/bookings/:id/status (chỉ ADMIN)', () => {
    it('trả về 403 khi user thường cố đổi trạng thái đơn của người khác', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: 1, role: 'USER' });

      const res = await request(app)
        .put('/api/bookings/5/status')
        .set('Authorization', `Bearer ${tokenFor(1, 'USER')}`)
        .send({ status: 'CONFIRMED' });

      expect(res.status).toBe(403);
    });

    it('ADMIN duyệt đơn (PENDING -> CONFIRMED) và phòng được đánh dấu hết trống', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: 99, role: 'ADMIN' });
      prismaMock.booking.findUnique.mockResolvedValueOnce({ id: 5, roomId: 10, status: 'PENDING' });
      prismaMock.booking.update.mockResolvedValueOnce({ id: 5, status: 'CONFIRMED' });
      prismaMock.room.update.mockResolvedValueOnce({ id: 10, isAvailable: false });

      const res = await request(app)
        .put('/api/bookings/5/status')
        .set('Authorization', `Bearer ${tokenFor(99, 'ADMIN')}`)
        .send({ status: 'CONFIRMED' });

      expect(res.status).toBe(200);
      expect(prismaMock.room.update).toHaveBeenCalledWith({ where: { id: 10 }, data: { isAvailable: false } });
    });
  });
});
