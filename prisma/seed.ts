import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create permissions
  const permissions = [
    // User management
    { name: "users:create", description: "Create new users" },
    { name: "users:read", description: "View user information" },
    { name: "users:update", description: "Update user information" },
    { name: "users:delete", description: "Delete users" },
    // Role management
    { name: "roles:assign", description: "Assign roles to users" },
    { name: "roles:read", description: "View role information" },
    // Tour management
    { name: "tours:create", description: "Create new tours" },
    { name: "tours:read", description: "View tours" },
    { name: "tours:update", description: "Update tour information" },
    { name: "tours:delete", description: "Delete tours" },
    // Lodge management
    { name: "lodges:create", description: "Create new lodges" },
    { name: "lodges:read", description: "View lodges" },
    { name: "lodges:update", description: "Update lodge information" },
    { name: "lodges:delete", description: "Delete lodges" },
    // Booking management
    { name: "bookings:create", description: "Create new bookings" },
    { name: "bookings:read", description: "View bookings" },
    { name: "bookings:update", description: "Update booking information" },
    { name: "bookings:delete", description: "Delete bookings" },
    { name: "bookings:approve", description: "Approve or decline bookings" },
    // Gallery management
    { name: "galleries:create", description: "Create new gallery items" },
    { name: "galleries:read", description: "View gallery items" },
    { name: "galleries:update", description: "Update gallery items" },
    { name: "galleries:delete", description: "Delete gallery items" },
    // Journal management
    { name: "journals:create", description: "Create new journal entries" },
    { name: "journals:read", description: "View journal entries" },
    { name: "journals:update", description: "Update journal entries" },
    { name: "journals:delete", description: "Delete journal entries" },
    // Team management
    { name: "team:create", description: "Create team members" },
    { name: "team:read", description: "View team members" },
    { name: "team:update", description: "Update team member information" },
    { name: "team:delete", description: "Delete team members" },
    // Profile management
    { name: "profile:read", description: "View profile information" },
    { name: "profile:update", description: "Update own profile" },
  ];

  for (const permission of permissions) {
    const existingPermission = await prisma.permission.findUnique({
      where: { name: permission.name },
    });

    if (!existingPermission) {
      await prisma.permission.create({
        data: permission,
      });
      console.log(`✅ Created permission: ${permission.name}`);
    } else {
      console.log(`⏭️  Permission already exists: ${permission.name}`);
    }
  }

  // Create roles
  const roles = [
    {
      name: "SUPER_ADMIN",
      description: "Full system access, user management, role assignment",
    },
    {
      name: "ADMIN",
      description: "Content management, booking approval, team management",
    },
    {
      name: "STAFF",
      description: "Limited content access, booking viewing",
    },
    {
      name: "TOURIST",
      description: "Public access, booking creation, profile management",
    },
  ];

  const createdRoles: Record<string, string> = {};

  for (const role of roles) {
    const existingRole = await prisma.role.findUnique({
      where: { name: role.name },
    });

    if (!existingRole) {
      const newRole = await prisma.role.create({
        data: role,
      });
      createdRoles[role.name] = newRole.id;
      console.log(`✅ Created role: ${role.name}`);
    } else {
      createdRoles[role.name] = existingRole.id;
      console.log(`⏭️  Role already exists: ${role.name}`);
    }
  }

  // Assign permissions to roles
  const rolePermissions: Record<string, string[]> = {
    SUPER_ADMIN: [
      "users:create",
      "users:read",
      "users:update",
      "users:delete",
      "roles:assign",
      "roles:read",
      "tours:create",
      "tours:read",
      "tours:update",
      "tours:delete",
      "lodges:create",
      "lodges:read",
      "lodges:update",
      "lodges:delete",
      "bookings:create",
      "bookings:read",
      "bookings:update",
      "bookings:delete",
      "bookings:approve",
      "galleries:create",
      "galleries:read",
      "galleries:update",
      "galleries:delete",
      "journals:create",
      "journals:read",
      "journals:update",
      "journals:delete",
      "team:create",
      "team:read",
      "team:update",
      "team:delete",
      "profile:read",
      "profile:update",
    ],
    ADMIN: [
      "tours:create",
      "tours:read",
      "tours:update",
      "tours:delete",
      "lodges:create",
      "lodges:read",
      "lodges:update",
      "lodges:delete",
      "bookings:read",
      "bookings:update",
      "bookings:approve",
      "galleries:create",
      "galleries:read",
      "galleries:update",
      "galleries:delete",
      "journals:create",
      "journals:read",
      "journals:update",
      "journals:delete",
      "team:create",
      "team:read",
      "team:update",
      "team:delete",
      "profile:read",
      "profile:update",
    ],
    STAFF: [
      "tours:read",
      "lodges:read",
      "bookings:read",
      "galleries:read",
      "journals:read",
      "team:read",
      "profile:read",
    ],
    TOURIST: [
      "tours:read",
      "lodges:read",
      "bookings:create",
      "bookings:read",
      "galleries:read",
      "journals:read",
      "profile:read",
      "profile:update",
    ],
  };

  for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
    const role = await prisma.role.findUnique({
      where: { name: roleName },
      include: { permissions: true },
    });

    if (role) {
      const existingPermissionNames = role.permissions.map((p) => p.name);
      const permissionsToAdd = permissionNames.filter(
        (name) => !existingPermissionNames.includes(name),
      );

      if (permissionsToAdd.length > 0) {
        const permissions = await prisma.permission.findMany({
          where: { name: { in: permissionsToAdd } },
        });

        await prisma.role.update({
          where: { id: role.id },
          data: {
            permissions: {
              connect: permissions.map((p) => ({ id: p.id })),
            },
          },
        });
        console.log(
          `✅ Assigned ${permissionsToAdd.length} permissions to ${roleName}`,
        );
      } else {
        console.log(`⏭️  ${roleName} already has all required permissions`);
      }
    }
  }

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
