const prisma = require('../config/prisma');
const { catchAsync, AppError } = require('../utils/AppError');

// GET /api/admin/users (ADMIN)
exports.getUsers = catchAsync(async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true,
      isEmailVerified: true, createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: users });
});

// PUT /api/admin/users/:id/role (ADMIN)
exports.updateUserRole = catchAsync(async (req, res, next) => {
  const id = Number(req.params.id);
  const { role } = req.body;
  if (!['USER', 'ADMIN'].includes(role)) {
    return next(new AppError('Vai trò không hợp lệ.', 400));
  }
  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });
  res.json({ success: true, message: 'Cập nhật vai trò thành công.', data: user });
});

// GET /api/admin/rooms (ADMIN) - lấy TẤT CẢ phòng, không lọc isAvailable như API công khai
exports.getAllRooms = catchAsync(async (req, res) => {
  const rooms = await prisma.room.findMany({
    include: { category: true, images: { take: 1 } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: rooms });
});

// GET /api/admin/stats (ADMIN) - dữ liệu tổng quan cho dashboard
exports.getStats = catchAsync(async (req, res) => {
  const [totalUsers, totalRooms, totalBookings, availableRooms, pendingBookings] = await Promise.all([
    prisma.user.count(),
    prisma.room.count(),
    prisma.booking.count(),
    prisma.room.count({ where: { isAvailable: true } }),
    prisma.booking.count({ where: { status: 'PENDING' } }),
  ]);

  res.json({
    success: true,
    data: { totalUsers, totalRooms, totalBookings, availableRooms, pendingBookings },
  });
});
