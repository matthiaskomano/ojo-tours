import { getAllUsers, getUserStats } from "@/actions/userManagementActions";
import { getAllRoles } from "@/actions/userManagementActions";
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Shield,
  Crown,
  ChevronRight,
  Mail,
  Calendar,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    search?: string;
    role?: string;
    status?: string;
  };
}) {
  const page = parseInt(searchParams.page || "1");
  const search = searchParams.search || "";
  const role = searchParams.role || "";
  const status = searchParams.status || "";

  const [usersData, stats, roles] = await Promise.all([
    getAllUsers({ page, limit: 20, search, role, status }),
    getUserStats(),
    getAllRoles(),
  ]);

  const getRoleBadge = (roleName: string) => {
    const styles: Record<string, { color: string; icon: any }> = {
      SUPER_ADMIN: {
        color: "bg-purple-100 text-purple-700 border-purple-200",
        icon: Crown,
      },
      ADMIN: {
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icon: Shield,
      },
      STAFF: {
        color: "bg-green-100 text-green-700 border-green-200",
        icon: UserCheck,
      },
      TOURIST: {
        color: "bg-gray-100 text-gray-700 border-gray-200",
        icon: Users,
      },
    };

    const style = styles[roleName] || styles.TOURIST;
    const Icon = style.icon;

    return (
      <Badge className={`${style.color} border`}>
        <Icon className="h-3 w-3 mr-1" />
        {roleName}
      </Badge>
    );
  };

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

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name or email..."
                className="pl-10"
                name="search"
                defaultValue={search}
              />
            </div>
          </div>

          <Select name="role" defaultValue={role}>
            <SelectTrigger className="w-full md:w-45">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.name}>
                  {role.name} ({role._count.users})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select name="status" defaultValue={status}>
            <SelectTrigger className="w-full md:w-45">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button
            type="submit"
            className="bg-linear-to-r from-[#d4af37] to-[#d3b673] hover:opacity-90 text-white cursor-pointer"
          >
            <Filter className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Reviews</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersData.users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-500"
                >
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              usersData.users.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#d4af37] to-[#d3b673] flex items-center justify-center text-white font-semibold">
                        {user.fullName?.charAt(0) ||
                          user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.fullName || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role.name)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.isActive ? "default" : "secondary"}
                      className={
                        user.isActive
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-red-100 text-red-700 border-red-200"
                      }
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {user._count.bookings}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {user._count.reviews}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="hover:bg-gray-100"
                    >
                      <Link href={`/dashboard/admin/users/${user.id}`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {usersData.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing{" "}
              {(usersData.pagination.page - 1) * usersData.pagination.limit + 1}{" "}
              to{" "}
              {Math.min(
                usersData.pagination.page * usersData.pagination.limit,
                usersData.pagination.total,
              )}{" "}
              of {usersData.pagination.total} users
            </p>
            <div className="flex gap-2">
              {usersData.pagination.page > 1 && (
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={{
                      pathname: "/dashboard/admin/users",
                      query: {
                        ...searchParams,
                        page: (usersData.pagination.page - 1).toString(),
                      },
                    }}
                  >
                    Previous
                  </Link>
                </Button>
              )}
              {usersData.pagination.page < usersData.pagination.totalPages && (
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={{
                      pathname: "/dashboard/admin/users",
                      query: {
                        ...searchParams,
                        page: (usersData.pagination.page + 1).toString(),
                      },
                    }}
                  >
                    Next
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
