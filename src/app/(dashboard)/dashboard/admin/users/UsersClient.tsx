"use client";

import {
  Users,
  Search,
  UserCheck,
  UserX,
  Shield,
  Crown,
  ChevronRight,
  Mail,
  Calendar,
  Eye,
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
import { useState, useMemo } from "react";

interface User {
  id: string;
  email: string;
  fullName: string | null;
  avatar: string | null;
  roleId: string;
  isActive: boolean;
  createdAt: string;
  role: {
    id: string;
    name: string;
  };
  _count: {
    bookings: number;
    reviews: number;
    wishlist: number;
  };
}

interface Role {
  id: string;
  name: string;
  _count: {
    users: number;
  };
}

interface UsersClientProps {
  users: User[];
  roles: Role[];
}

export function UsersClient({ users, roles }: UsersClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        !searchQuery ||
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = !selectedRole || user.role.name === selectedRole;

      const matchesStatus =
        !selectedStatus ||
        (selectedStatus === "active" && user.isActive) ||
        (selectedStatus === "inactive" && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, selectedRole, selectedStatus]);

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

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedRole("");
    setSelectedStatus("");
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
              <Input
                placeholder="Search users by name or email..."
                className="pl-10 text-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-full md:w-45 text-black">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="" className="text-black">All Roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.name} className="text-black">
                  {role.name} ({role._count.users})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full md:w-45 text-black">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="" className="text-black">All Status</SelectItem>
              <SelectItem value="active" className="text-black">Active</SelectItem>
              <SelectItem value="inactive" className="text-black">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleResetFilters}
            variant="outline"
            className="cursor-pointer text-black"
          >
            Reset
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
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-500"
                >
                  No users found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4af37] to-[#d3b673] flex items-center justify-center text-white font-semibold">
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
                      className="hover:bg-gray-100 text-black"
                    >
                      <Link href={`/dashboard/admin/users/${user.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Results count */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </div>
      </div>
    </div>
  );
}
