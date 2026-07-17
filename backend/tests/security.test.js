const request = require('supertest');

jest.mock('../src/config/prisma', () => require('./helpers/prismaMock'));
jest.mock('../src/utils/mailer', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue({ simulated: true }),
  sendResetPasswordEmail: jest.fn().mockResolvedValue({ simulated: true }),
}));

const prismaMock = require('./helpers/prismaMock');
const app = require('../src/app');

describe('Bảo mật (OWASP cơ bản)', () => {
  beforeEach(() => {
    prismaMock.resetPrismaMock();
  });

  it('Helmet đã set các security header quan trọng', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-dns-prefetch-control']).toBeDefined();
    // Helmet ẩn header tiết lộ công nghệ backend
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('route không tồn tại trả về 404 rõ ràng thay vì crash', async () => {
    const res = await request(app).get('/api/khong-ton-tai');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('CHỐNG XSS: chuỗi HTML/script độc hại trong body bị làm sạch trước khi tới controller', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.create.mockImplementationOnce(({ data }) => Promise.resolve({ id: 1, role: 'USER', ...data }));

    await request(app).post('/api/auth/register').send({
      name: '<script>alert(1)</script>',
      email: 'xss@example.com',
      password: 'Password123',
    });

    const dataPassedToCreate = prismaMock.user.create.mock.calls[0][0].data;
    expect(dataPassedToCreate.name).not.toContain('<script>');
  });

  it('KHÔNG lộ stack trace lỗi 500 khi NODE_ENV=production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    prismaMock.user.findUnique.mockRejectedValueOnce(new Error('DB die bất ngờ'));

    const res = await request(app).post('/api/auth/login').send({
      email: 'a@example.com',
      password: 'Password123',
    });

    expect(res.status).toBe(500);
    expect(res.body.stack).toBeUndefined();

    process.env.NODE_ENV = originalEnv;
  });

  it('response của /auth/login KHÔNG chứa field password dù thành công hay thất bại', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    const res = await request(app).post('/api/auth/login').send({
      email: 'khong-ton-tai@example.com',
      password: 'bat-ky',
    });
    expect(JSON.stringify(res.body)).not.toContain('password');
  });

  it('body JSON quá lớn (>10kb) bị từ chối', async () => {
    const bigNote = 'a'.repeat(20 * 1024); // 20kb
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'A', email: 'big@example.com', password: 'Password123', note: bigNote });
    // express body-parser trả 413 khi vượt limit
    expect([413, 422]).toContain(res.status);
  });
});
