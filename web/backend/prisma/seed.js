/**
 * Seed script - Tạo dữ liệu mẫu: admin/user account, categories, rooms + ảnh
 * Chạy: node prisma/seed.js
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const districts = ['Quận 1', 'Quận 3', 'Quận 7', 'Quận Bình Thạnh', 'Quận Gò Vấp', 'Quận Tân Bình', 'Thủ Đức'];
const categoryList = [
  { name: 'Phòng trọ giá rẻ', slug: 'phong-tro-gia-re' },
  { name: 'Chung cư mini', slug: 'chung-cu-mini' },
  { name: 'Căn hộ dịch vụ', slug: 'can-ho-dich-vu' },
  { name: 'Nhà nguyên căn', slug: 'nha-nguyen-can' },
];

const sampleImages = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb',
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu...');

  // --- Users ---
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const userPassword = await bcrypt.hash('User@123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Quản trị viên',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
      isEmailVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      name: 'Người dùng mẫu',
      email: 'user@example.com',
      password: userPassword,
      role: 'USER',
      isEmailVerified: true,
    },
  });

  // --- Categories ---
  const categories = [];
  for (const cat of categoryList) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories.push(c);
  }

  // --- Rooms (gen 30 phòng) ---
  const existingRooms = await prisma.room.count();
  if (existingRooms === 0) {
    for (let i = 1; i <= 30; i++) {
      const category = randomItem(categories);
      const district = randomItem(districts);
      const price = randomInt(15, 80) * 100000; // 1.5tr - 8tr
      const room = await prisma.room.create({
        data: {
          title: `${category.name} ${district} #${i}`,
          description:
            'Phòng trọ thoáng mát, đầy đủ nội thất cơ bản, an ninh 24/7, gần chợ và trường học. Giờ giấc tự do, có chỗ để xe.',
          price,
          area: randomInt(15, 45),
          address: `${randomInt(1, 200)} Đường số ${randomInt(1, 50)}`,
          district,
          city: 'Hồ Chí Minh',
          maxPeople: randomInt(1, 4),
          isAvailable: Math.random() > 0.2,
          categoryId: category.id,
          images: {
            create: Array.from({ length: 3 }).map(() => ({
              url: `${randomItem(sampleImages)}?auto=format&fit=crop&w=800&q=60`,
            })),
          },
        },
      });
      process.stdout.write(`\r  Đã tạo ${i}/30 phòng - ID mới nhất: ${room.id}`);
    }
    console.log('\n✅ Đã tạo 30 phòng mẫu.');
  } else {
    console.log('ℹ️  Đã có dữ liệu phòng, bỏ qua bước tạo phòng.');
  }

  console.log('🎉 Seed hoàn tất!');
  console.log('   Admin: admin@example.com / Admin@123');
  console.log('   User:  user@example.com  / User@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
