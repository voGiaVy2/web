const { PrismaClient } = require('@prisma/client');

// Singleton Prisma Client để tránh mở quá nhiều connection
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

module.exports = prisma;
