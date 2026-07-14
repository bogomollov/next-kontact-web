import { vi } from "vitest";

export const redisMock = {
  get: vi.fn(),
  set: vi.fn(),
  incr: vi.fn(),
  expire: vi.fn(),
  isOpen: true,
  connect: vi.fn(),
  on: vi.fn(),
};

export const markOnlineMock = vi.fn();
export const connectRedisMock = vi.fn();

export function resetRedisMock() {
  redisMock.get.mockReset();
  redisMock.set.mockReset();
  // Default to "first request in the window" so rateLimit-wrapped routes
  // aren't blocked unless a test explicitly overrides this to hit the 429 path.
  redisMock.incr.mockReset().mockResolvedValue(1);
  redisMock.expire.mockReset();
  redisMock.connect.mockReset();
  markOnlineMock.mockReset();
  connectRedisMock.mockReset();
}
