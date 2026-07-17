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

// GET /api/bookings (ADMIN) - xem toàn bộ đơn đặt phòng để duyệt
exports.getAllBookings = catchAsync(async (req, res) => {
  const { status } = req.query;
  const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];

  const bookings = await prisma.booking.findMany({
    where: status && validStatuses.includes(status) ? { status } : undefined,
    include: {
      user: { select: { id: true, name: true, email: true } },
      room: { select: { id: true, title: true, district: true, price: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: bookings });
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

// PUT /api/bookings/:id/cancel (User tự huỷ đơn của chính mình)
exports.cancelMyBooking = catchAsync(async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return next(new AppError('ID đơn đặt phòng không hợp lệ.', 400));

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return next(new AppError('Không tìm thấy đơn đặt phòng.', 404));

  // Chỉ chủ đơn mới được huỷ đơn của chính mình -> chống IDOR/broken access control
  if (booking.userId !== req.user.id) {
    return next(new AppError('Bạn không có quyền huỷ đơn đặt phòng này.', 403));
  }

  if (['CANCELLED', 'COMPLETED'].includes(booking.status)) {
    return next(new AppError('Đơn đặt phòng này không thể huỷ ở trạng thái hiện tại.', 400));
  }

  const updated = await prisma.$transaction(async (tx) => {
    const cancelled = await tx.booking.update({ where: { id }, data: { status: 'CANCELLED' } });

    // Nếu phòng đang bị đánh dấu hết trống vì đơn này, và không còn đơn nào khác
    // đang PENDING/CONFIRMED, thì mở lại phòng.
    const stillActive = await tx.booking.count({
      where: { roomId: booking.roomId, status: { in: ['PENDING', 'CONFIRMED'] }, id: { not: id } },
    });
    if (stillActive === 0) {
      await tx.room.update({ where: { id: booking.roomId }, data: { isAvailable: true } });
    }

    return cancelled;
  }, { maxWait: 10000, timeout: 15000 });

  res.json({ success: true, message: 'Huỷ đơn đặt phòng thành công.', data: updated });
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

  // Dùng transaction để đảm bảo trạng thái đơn và trạng thái phòng luôn đồng bộ,
  // tránh trường hợp cập nhật nửa chừng bị lỗi giữa 2 bảng.
  const updated = await prisma.$transaction(async (tx) => {
    const updatedBooking = await tx.booking.update({ where: { id }, data: { status } });

    if (status === 'CONFIRMED') {
      // Đơn được duyệt -> đánh dấu phòng hết trống ngay lập tức
      await tx.room.update({ where: { id: booking.roomId }, data: { isAvailable: false } });
    } else if (status === 'CANCELLED' || status === 'COMPLETED') {
      // Đơn bị huỷ hoặc đã hoàn tất -> chỉ mở lại phòng nếu KHÔNG còn đơn nào khác
      // đang PENDING/CONFIRMED cho phòng này (tránh mở nhầm khi có đơn chờ khác).
      const stillActive = await tx.booking.count({
        where: { roomId: booking.roomId, status: { in: ['PENDING', 'CONFIRMED'] }, id: { not: id } },
      });
      if (stillActive === 0) {
        await tx.room.update({ where: { id: booking.roomId }, data: { isAvailable: true } });
      }
    }

    return updatedBooking;
  }, { maxWait: 10000, timeout: 15000 });

  res.json({ success: true, message: 'Cập nhật trạng thái thành công.', data: updated });
});