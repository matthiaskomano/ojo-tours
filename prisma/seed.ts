import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create roles
  const roles = [
    {
      name: 'SUPER_ADMIN',
      description: 'Full system access, user management, role assignment',
    },
    {
      name: 'ADMIN',
      description: 'Content management, booking approval, team management',
    },
    {
      name: 'STAFF',
      description: 'Limited content access, booking viewing',
    },
    {
      name: 'TOURIST',
      description: 'Public access, booking creation, profile management',
    },
  ];

  for (const role of roles) {
    const existingRole = await prisma.role.findUnique({
      where: { name: role.name },
    });

    if (!existingRole) {
      await prisma.role.create({
        data: role,
      });
      console.log(`✅ Created role: ${role.name}`);
    } else {
      console.log(`⏭️  Role already exists: ${role.name}`);
    }
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
