import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { AdminRole, PrismaClient, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 12;
const ADMIN_EMAIL = 'admin@goldapp.mn';
const ADMIN_PASSWORD = 'Admin@12345';

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_ROUNDS);

    const admin = await prisma.adminUser.upsert({
      where: { email: ADMIN_EMAIL },
      create: {
        email: ADMIN_EMAIL,
        passwordHash,
        name: 'Super Admin',
        role: AdminRole.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
      },
      update: {
        passwordHash,
        name: 'Super Admin',
        role: AdminRole.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
      },
    });

    // eslint-disable-next-line no-console
    console.log(`Admin user seeded: ${admin.email} (${admin.role}, ${admin.status})`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error('Prisma seed failed:', error);
  process.exit(1);
});
