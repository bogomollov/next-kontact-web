import { prisma } from "../lib/prisma";
import { paginate, PaginationParams } from "../lib/pagination";

export async function getDashboardData(pagination: PaginationParams) {
  const [users, accounts, positions, departments] = await Promise.all([
    prisma.user.findMany({ skip: pagination.skip, take: pagination.take }),
    prisma.account.findMany({
      omit: { password: true },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.position.findMany({ skip: pagination.skip, take: pagination.take }),
    prisma.department.findMany({ skip: pagination.skip, take: pagination.take }),
  ]);
  return { users, accounts, positions, departments };
}

export async function getDepartments(pagination: PaginationParams) {
  const [data, total] = await prisma.$transaction([
    prisma.department.findMany({ skip: pagination.skip, take: pagination.take }),
    prisma.department.count(),
  ]);

  return paginate(data, total, pagination);
}

export async function getPositions(pagination: PaginationParams) {
  const [data, total] = await prisma.$transaction([
    prisma.position.findMany({ skip: pagination.skip, take: pagination.take }),
    prisma.position.count(),
  ]);

  return paginate(data, total, pagination);
}
