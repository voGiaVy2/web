const request = require('supertest');

jest.mock('../src/config/prisma', () => require('./helpers/prismaMock'));
jest.mock('../src/utils/mailer', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue({ simulated: true }),
  sendResetPasswordEmail: jest.fn().mockResolvedValue({ simulated: true }),
}));

const prismaMock = require('./helpers/prismaMock');
const app = require('../src/app');

describe('Auth API', () => {
  beforeEach(() => {
    prismaMock.resetPrismaMock();
  });

  describe('POST /api/auth/register', () => {
    it('đăng ký thành công với dữ liệu hợp lệ và KHÔNG lộ password trong response', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null); // email chưa tồn tại
      prismaMock.user.create.mockResolvedValueOnce({
        id: 1,
        name: 'Nguyen Van A',
        email: 'a@example.com',
        password: 'hashed_should_never_leak',
        role: 'USER',
        isEmailVerified: false,
        emailVerifyToken: 'token123',
        resetPasswordToken: null,
        resetPasswordExpires: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app).post('/api/auth/register').send({
        name: 'Nguyen Van A',
        email: 'a@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.password).toBeUndefined();
      expect(res.body.user.emailVerifyToken).toBeUndefined();
      expect(res.body.user.role).toBe('USER');
    });

    it('CHỐNG MASS ASSIGNMENT: gửi kèm role=ADMIN khi đăng ký vẫn chỉ tạo user role USER', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      prismaMock.user.create.mockImplementationOnce(({ data }) =>
        Promise.resolve({ id: 2, role: 'USER', ...data })
      );

      await request(app).post('/api/auth/register').send({
        name: 'Hacker',
        email: 'hacker@example.com',
        password: 'Password123',
        role: 'ADMIN', // cố tình chèn thêm field không được phép
      });

      const dataPassedToCreate = prismaMock.user.create.mock.calls[0][0].data;
      expect(dataPassedToCreate.role).toBeUndefined(); // controller không đọc req.body.role
    });

    it('từ chối đăng ký khi email đã tồn tại (409)', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: 1, email: 'a@example.com' });

      const res = await request(app).post('/api/auth/register').send({
        name: 'Nguyen Van A',
        email: 'a@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('từ chối đăng ký khi mật khẩu quá ngắn / không có chữ số (422)', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Nguyen Van A',
        email: 'b@example.com',
        password: 'short',
      });

      expect(res.status).toBe(422);
      expect(res.body.errors.some((e) => e.field === 'password')).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    it('đăng nhập thất bại khi email không tồn tại -> message CHUNG CHUNG (chống user enumeration)', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'khong-ton-tai@example.com', password: 'Password123' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Email hoặc mật khẩu không đúng.');
    });

    it('đăng nhập thất bại khi sai mật khẩu -> CÙNG message như email không tồn tại', async () => {
      const bcrypt = require('bcryptjs');
      const realHash = await bcrypt.hash('MatKhauDung123', 12);
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email: 'a@example.com',
        password: realHash,
        role: 'USER',
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'a@example.com', password: 'MatKhauSai' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Email hoặc mật khẩu không đúng.');
    });

    it('đăng nhập thành công trả về JWT hợp lệ và không lộ password', async () => {
      const bcrypt = require('bcryptjs');
      const realHash = await bcrypt.hash('Password123', 12);
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: 1,
        name: 'Nguyen Van A',
        email: 'a@example.com',
        password: realHash,
        role: 'USER',
        isEmailVerified: true,
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'a@example.com', password: 'Password123' });

      expect(res.status).toBe(200);
      expect(res.body.token.split('.')).toHaveLength(3); // định dạng JWT hợp lệ
      expect(res.body.user.password).toBeUndefined();
    });
  });

  describe('GET /api/auth/me', () => {
    it('trả về 401 khi không có token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('trả về 401 khi token không hợp lệ', async () => {
      const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer token-gia-mao');
      expect(res.status).toBe(401);
    });

    it('trả về thông tin user (không có password) khi token hợp lệ', async () => {
      const { signAccessToken } = require('../src/utils/jwt');
      const token = signAccessToken({ id: 1, role: 'USER' });

      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: 1,
        name: 'Nguyen Van A',
        email: 'a@example.com',
        password: 'hashed',
        role: 'USER',
      });

      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.id).toBe(1);
      expect(res.body.user.password).toBeUndefined();
    });
  });
});
