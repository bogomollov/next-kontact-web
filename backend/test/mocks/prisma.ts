import { mockDeep, mockReset, type DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "../../generated/prisma/client";

export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient> &
  PrismaClient;

export function resetPrismaMock() {
  mockReset(prismaMock);
  // Support both $transaction([...]) and $transaction(async (tx) => ...) call shapes.
  (prismaMock.$transaction as unknown as { mockImplementation: (fn: (arg: unknown) => unknown) => void }).mockImplementation(
    (arg: unknown) => {
      if (Array.isArray(arg)) return Promise.all(arg);
      if (typeof arg === "function") return (arg as (tx: PrismaClient) => unknown)(prismaMock);
      return Promise.resolve(arg);
    }
  );
}
