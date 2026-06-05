import { prisma } from "../lib/prisma";

export async function getDashboardData() {
  const [users, accounts, positions, departments] = await Promise.all([
    prisma.user.findMany(),
    prisma.account.findMany({ omit: { password: true } }),
    prisma.position.findMany(),
    prisma.department.findMany(),
  ]);
  return { users, accounts, positions, departments };
}

export async function getDepartments() {
  return prisma.department.findMany();
}

export async function getPositions() {
  return prisma.position.findMany();
}
