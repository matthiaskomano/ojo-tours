import { getAllUsers, getUserStats } from "@/actions/userManagementActions";
import { getAllRoles } from "@/actions/userManagementActions";
import { Users, UserCheck, UserX, Shield } from "lucide-react";
import { StatsCardSkeleton } from "@/components/ui/skeleton-loaders";
import { Suspense } from "react";
import { UsersClient } from "./UsersClient";


export const dynamic = "force-dynamic";

async function UsersContent({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: string;
    status?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  
  const [usersData, stats, roles] = await Promise.all([
    getAllUsers({ page: 1, limit: 1000 }),
    getUserStats(),
    getAllRoles(),
  ]);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            User Management
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage users, roles, and permissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Active Users
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.activeUsers}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Inactive Users
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.inactiveUsers}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Roles</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.usersByRole.length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client component with filtering */}
      <UsersClient users={usersData.users} roles={roles} />
    </div>
  );
}

export default function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: string;
    status?: string;
  }>;
}) {
  return (
    <Suspense fallback={<UsersPageSkeleton />}>
      <UsersContent searchParams={searchParams} />
    </Suspense>
  );
}

function UsersPageSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="space-y-3">
        <div className="h-8 w-64 bg-muted rounded" />
        <div className="h-4 w-96 bg-muted rounded" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="h-10 w-full bg-muted rounded" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
