import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();

// Reference data the app hard-depends on: registration assigns every new
// account role_id 1 / department_id 1 / position_id 1, so these rows must
// exist (and in this order) before the app can accept signups. This is the
// only seeding that runs in production — no accounts or demo content here.
export async function seedEssential() {
  const userRole = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: { name: "user" },
  });
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" },
  });

  const departmentNames = [
    "Отдел развития цифровых технологий",
    "Отдел цифрового развития в финансово-экономической сфере",
    "Отдел цифрового развития в социальной сфере",
    "Отдел цифрового развития в сфере государственного управления",
    "Отдел цифрового развития местного самоуправления",
    "Отдел геоинформационных систем",
    "Управление связи и коммуникаций",
  ];
  const departments = [];
  for (const name of departmentNames) {
    departments.push(
      await prisma.department.upsert({ where: { name }, update: {}, create: { name } })
    );
  }

  const positionNames = [
    "Консультант",
    "Главный специалист",
    "Старший специалист",
    "Ведущий эксперт",
    "Специалист 2 разряда",
    "Помощник министра",
  ];
  const positions = [];
  for (const name of positionNames) {
    positions.push(
      await prisma.position.upsert({ where: { name }, update: {}, create: { name } })
    );
  }

  return { userRole, adminRole, departments, positions };
}

if (require.main === module) {
  seedEssential()
    .then(async () => {
      console.log("Базовые данные загружены");
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
