const prisma = require('../config/prisma');
const { catchAsync, AppError } = require('../utils/AppError');

// GET /api/rooms?search=&district=&categoryId=&minPrice=&maxPrice=&page=&limit=
exports.getRooms = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 12, 100);
  const skip = (page - 1) * limit;

  const { search, district, categoryId, minPrice, maxPrice, sort } = req.query;

  // Xây dựng điều kiện lọc động - dùng Prisma (chống SQL Injection tự động,
  // không nối chuỗi SQL thủ công)
  const where = {
    isAvailable: true,
    ...(search && {
      OR: [
        { title: { contains: search } },
        { description: { contains: search } },
        { address: { contains: search } },
      ],
    }),
    ...(district && { district: { equals: district } }),
    ...(categoryId && { categoryId: Number(categoryId) }),
    ...((minPrice || maxPrice) && {
      price: {
        ...(minPrice && { gte: Number(minPrice) }),
        ...(maxPrice && { lte: Number(maxPrice) }),
      },
    }),
  };

  const orderBy =
    sort === 'price_asc' ? { price: 'asc' } :
    sort === 'price_desc' ? { price: 'desc' } :
    { createdAt: 'desc' };

  const [rooms, total] = await Promise.all([
    prisma.room.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: { category: true, images: { take: 1 } },
    }),
    prisma.room.count({ where }),
  ]);

  res.json({
    success: true,
    data: rooms,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /api/rooms/:id
exports.getRoomById = catchAsync(async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return next(new AppError('ID phòng không hợp lệ.', 400));

  const room = await prisma.room.findUnique({
    where: { id },
    include: { category: true, images: true },
  });

  if (!room) return next(new AppError('Không tìm thấy phòng.', 404));

  res.json({ success: true, data: room });
});

// POST /api/rooms (ADMIN)
exports.createRoom = catchAsync(async (req, res, next) => {
  const {
    title, description, price, area, address, ward,
    district, city, maxPeople, categoryId, images,
  } = req.body;

  const category = await prisma.category.findUnique({ where: { id: Number(categoryId) } });
  if (!category) return next(new AppError('Danh mục không tồn tại.', 400));

  const room = await prisma.room.create({
    data: {
      title, description, price, area, address, ward,
      district, city: city || 'Hồ Chí Minh', maxPeople: maxPeople || 1,
      categoryId: Number(categoryId),
      images: images?.length
        ? { create: images.map((url) => ({ url })) }
        : undefined,
    },
    include: { category: true, images: true },
  });

  res.status(201).json({ success: true, message: 'Tạo phòng thành công.', data: room });
});

// PUT /api/rooms/:id (ADMIN)
exports.updateRoom = catchAsync(async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return next(new AppError('ID phòng không hợp lệ.', 400));

  const existing = await prisma.room.findUnique({ where: { id } });
  if (!existing) return next(new AppError('Không tìm thấy phòng.', 404));

  const allowedFields = [
    'title', 'description', 'price', 'area', 'address', 'ward',
    'district', 'city', 'maxPeople', 'isAvailable', 'categoryId',
  ];
  const data = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) data[field] = req.body[field];
  }
  if (data.categoryId) data.categoryId = Number(data.categoryId);

  const room = await prisma.room.update({ where: { id }, data, include: { category: true, images: true } });

  res.json({ success: true, message: 'Cập nhật phòng thành công.', data: room });
});

// DELETE /api/rooms/:id (ADMIN)
exports.deleteRoom = catchAsync(async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return next(new AppError('ID phòng không hợp lệ.', 400));

  const existing = await prisma.room.findUnique({ where: { id } });
  if (!existing) return next(new AppError('Không tìm thấy phòng.', 404));

  await prisma.room.delete({ where: { id } });

  res.json({ success: true, message: 'Xóa phòng thành công.' });
});

// GET /api/categories
exports.getCategories = catchAsync(async (req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  res.json({ success: true, data: categories });
});
