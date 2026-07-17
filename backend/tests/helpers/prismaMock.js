/**
 * Mock Prisma Client dùng chung cho toàn bộ test.
 * Test API là "integration test" ở tầng route/controller/middleware, không đụng DB thật
 * (không cần MySQL khi chạy CI) — mọi lời gọi tới prisma.<model>.<method> đều là jest.fn()
 * có thể set giá trị trả về theo từng test bằng mockResolvedValueOnce / mockImplementation.
 */
function buildModelMock() {
  return {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    upsert: jest.fn(),
  };
}

const prismaMock = {
  user: buildModelMock(),
  room: buildModelMock(),
  category: buildModelMock(),
  image: buildModelMock(),
  booking: buildModelMock(),
  // $transaction nhận vào 1 callback (tx) => {...} giống Prisma thật.
  // Mặc định pass thẳng chính prismaMock làm "tx" để các test có thể set mock trên đó luôn.
  $transaction: jest.fn(async (callback) => callback(prismaMock)),
};

function resetPrismaMock() {
  Object.values(prismaMock).forEach((model) => {
    if (model && typeof model === 'object') {
      Object.values(model).forEach((fn) => {
        if (typeof fn?.mockReset === 'function') fn.mockReset();
      });
    }
  });
  prismaMock.$transaction.mockReset();
  prismaMock.$transaction.mockImplementation(async (callback) => callback(prismaMock));
}

module.exports = prismaMock;
module.exports.resetPrismaMock = resetPrismaMock;
