import { beforeEach, vi } from "vitest";
import { prismaMock, resetPrismaMock } from "./mocks/prisma";
import { redisMock, markOnlineMock, connectRedisMock, resetRedisMock } from "./mocks/redis";

vi.mock("../src/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("../src/lib/redis", () => ({
  redis: redisMock,
  markOnline: markOnlineMock,
  connectRedis: connectRedisMock,
}));

beforeEach(() => {
  vi.resetAllMocks();
  resetPrismaMock();
  resetRedisMock();
});
