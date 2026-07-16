const prisma = require('../config/prisma');
const { catchAsync, AppError } = require('../utils/AppError');

// POST /api/bookings (yêu cầu đăng nhập)
exports.createBooking = catchAsync(async (req, res, next) => {
  const { roomId, fromDate, toDate, note } = req.body;

  if (!roomId || !fromDate || !toDate) {
    return next(new AppError('Vui lòng cung cấp đầy đủ thông tin đặt phòng.', 400));
  }

  const room = await prisma.room.findUnique({ where: { id: Number(roomId) } });
  if (!room) return next(new AppError('Phòng không tồn tại.', 404));
  if (!room.isAvailable) return next(new AppError('Phòng hiện không khả dụng.', 400));

  const from = new Date(fromDate);
  const to = new Date(toDate);
  if (isNaN(from) || isNaN(to) || from >= to) {
    return next(new AppError('Ngày nhận/trả phòng không hợp lệ.', 400));
  }

  const booking = await prisma.booking.create({
    data: { userId: req.user.id, roomId: room.id, fromDate: from, toDate: to, note },
    include: { room: true },
  });

  res.status(201).json({ success: true, message: 'Đặt phòng thành công.', data: booking });
});

// GET /api/bookings/me (yêu cầu đăng nhập)
exports.getMyBookings = catchAsync(async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: { userId: req.user.id },
    include: { room: { include: { images: { take: 1 } } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: bookings });
});

// PUT /api/bookings/:id/status (ADMIN)
exports.updateBookingStatus = catchAsync(async (req, res, next) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];

  if (!validStatuses.includes(status)) {
    return next(new AppError('Trạng thái không hợp lệ.', 400));
  }

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return next(new AppError('Không tìm thấy đơn đặt phòng.', 404));

  const updated = await prisma.booking.update({ where: { id }, data: { status } });
  res.json({ success: true, message: 'Cập nhật trạng thái thành công.', data: updated });
});
