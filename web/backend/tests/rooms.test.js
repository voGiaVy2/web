const request = require('supertest');

jest.mock('../src/config/prisma', () => require('./helpers/prismaMock'));
jest.mock('../src/utils/mailer', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue({ simulated: true }),
  sendResetPasswordEmail: jest.fn().mockResolvedValue({ simulated: true }),
}));

const prismaMock = require('./helpers/prismaMock');
const app = require('../src/app');
const { signAccessToken } = require('../src/utils/jwt');

const userToken = () => signAccessToken({ id: 1, role: 'USER' });
const adminToken = () => signAccessToken({ id: 99, role: 'ADMIN' });

describe('Room API', () => {
  beforeEach(() => {
    prismaMock.resetPrismaMock();
  });

  describe('GET /api/rooms', () => {
    it('trả về danh sách phòng có phân trang', async () => {
      prismaMock.room.findMany.mockResolvedValueOnce([{ id: 1, title: 'Phòng A' }]);
      prismaMock.room.count.mockResolvedValueOnce(1);

      const res = await request(app).get('/api/rooms');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination).toMatchObject({ page: 1, limit: 12, total: 1, totalPages: 1 });
    });

    it('từ chối limit vượt quá 100 ngay ở tầng validate (chống DoS qua query) (422)', async () => {
      const res = await request(app).get('/api/rooms?limit=99999');
      expect(res.status).toBe(422);
    });

    it('chấp nhận limit hợp lệ trong khoảng cho phép', async () => {
      prismaMock.room.findMany.mockResolvedValueOnce([]);
      prismaMock.room.count.mockResolvedValueOnce(0);

      const res = await request(app).get('/api/rooms?limit=50');

      expect(res.status).toBe(200);
      expect(res.body.pagination.limit).toBe(50);
    });

    it('từ chối minPrice âm hoặc không phải số (422)', async () => {
      const res = await request(app).get('/api/rooms?minPrice=-100');
      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/rooms/:id', () => {
    it('trả về 404 khi phòng không tồn tại', async () => {
      prismaMock.room.findUnique.mockResolvedValueOnce(null);
      const res = await request(app).get('/api/rooms/999');
      expect(res.status).toBe(404);
    });

    it('trả về 400 khi id không phải số nguyên', async () => {
      const res = await request(app).get('/api/rooms/abc');
      expect(res.status).toBe(400);
    });

    it('trả về chi tiết phòng khi id hợp lệ', async () => {
      prismaMock.room.findUnique.mockResolvedValueOnce({ id: 1, title: 'Phòng A', images: [] });
      const res = await request(app).get('/api/rooms/1');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(1);
    });
  });

  describe('Phân quyền tạo/sửa/xoá phòng (chỉ ADMIN)', () => {
    const validRoomPayload = {
      title: 'Phòng đẹp giá tốt',
      description: 'Mô tả phòng trọ đầy đủ tiện nghi',
      price: 3000000,
      area: 20,
      address: '123 Đường ABC',
      district: 'Quận 1',
      categoryId: 1,
    };

    it('trả về 401 khi tạo phòng mà chưa đăng nhập', async () => {
      const res = await request(app).post('/api/rooms').send(validRoomPayload);
      expect(res.status).toBe(401);
    });

    it('trả về 403 khi user thường (không phải ADMIN) cố tạo phòng', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: 1, role: 'USER' });

      const res = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${userToken()}`)
        .send(validRoomPayload);

      expect(res.status).toBe(403);
    });

    it('ADMIN tạo phòng thành công', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: 99, role: 'ADMIN' }); // middleware protect
      prismaMock.category.findUnique.mockResolvedValueOnce({ id: 1, name: 'Phòng giá rẻ' });
      prismaMock.room.create.mockResolvedValueOnce({ id: 10, ...validRoomPayload });

      const res = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send(validRoomPayload);

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBe(10);
    });

    it('trả về 400 khi ADMIN tạo phòng với categoryId không tồn tại', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: 99, role: 'ADMIN' });
      prismaMock.category.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send(validRoomPayload);

      expect(res.status).toBe(400);
    });

    it('trả về 403 khi user thường cố xoá phòng', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: 1, role: 'USER' });

      const res = await request(app)
        .delete('/api/rooms/1')
        .set('Authorization', `Bearer ${userToken()}`);

      expect(res.status).toBe(403);
    });
  });
});
