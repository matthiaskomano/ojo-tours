import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserRole(userId: string, roleId: string) {
  try {
    console.log('🔄 Updating user role...');

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      console.error('❌ User not found with ID:', userId);
      return;
    }

    // Verify role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      console.error('❌ Role not found with ID:', roleId);
      return;
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { roleId },
      include: { role: true },
    });

    console.log('✅ User role updated successfully!');
    console.log(`   User: ${updatedUser.email} (${updatedUser.fullName || 'No name'})`);
    console.log(`   Previous role: ${user.role?.name || 'No role'}`);
    console.log(`   New role: ${updatedUser.role.name}`);
  } catch (error) {
    console.error('❌ Error updating user role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get command line arguments
const userId = process.argv[2];
const roleId = process.argv[3];

if (!userId || !roleId) {
  console.log('Usage: npx tsx scripts/updateUserRole.ts <userId> <roleId>');
  console.log('Example: npx tsx scripts/updateUserRole.ts cm123abc cm456def');
  process.exit(1);
}

updateUserRole(userId, roleId);
