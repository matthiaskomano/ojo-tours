import { getUserById, getAllRoles } from "@/actions/userManagementActions";
import {
  updateUserRole,
  updateUserStatus,
  updateUserProfile,
  deleteUser,
} from "@/actions/userManagementActions";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Shield,
  Crown,
  UserCheck,
  UserX,
  MapPin,
  CreditCard,
  Star,
  Heart,
  Activity,
  Trash2,
  Save,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const [user, roles] = await Promise.all([
    getUserById(id),
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
        icon: UserCheck,
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="text-black">
          <Link href="/dashboard/admin/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            User Details
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage user account and permissions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#d4af37] to-[#d3b673] flex items-center justify-center text-white text-2xl font-bold">
                  {user.fullName?.charAt(0) ||
                    user.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {user.fullName || "Unknown User"}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </CardDescription>
                  <div className="mt-2">{getRoleBadge(user.role.name)}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4 text-gray-400" />
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
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Bookings</span>
                </div>
                <Badge variant="secondary">{user._count.bookings}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Reviews</span>
                </div>
                <Badge variant="secondary">{user._count.reviews}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Wishlist</span>
                </div>
                <Badge variant="secondary">{user._count.wishlist}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Role Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Role Management</CardTitle>
              <CardDescription>
                Change user role and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateUserRole} className="space-y-4">
                <input type="hidden" name="userId" value={user.id} />
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Current Role
                  </label>
                  <Select name="roleId" defaultValue={user.roleId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#d4af37] to-[#d3b673] hover:opacity-90 text-white cursor-pointer"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Update Role
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Status</CardTitle>
              <CardDescription>
                Activate or deactivate user account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateUserStatus} className="space-y-4">
                <input type="hidden" name="userId" value={user.id} />
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Status
                  </label>
                  <Select
                    name="isActive"
                    defaultValue={user.isActive ? "true" : "false"}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#d4af37] to-[#d3b673] hover:opacity-90 text-white cursor-pointer"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Update Status
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-lg text-red-600">
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={deleteUser} className="space-y-4">
                <input type="hidden" name="userId" value={user.id} />
                <Button
                  type="submit"
                  variant="destructive"
                  className="w-full"
                  disabled={user._count.bookings > 0}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {user._count.bookings > 0
                    ? "Cannot delete (has bookings)"
                    : "Delete User Account"}
                </Button>
                {user._count.bookings > 0 && (
                  <p className="text-xs text-gray-500">
                    Users with existing bookings cannot be deleted
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Activity & Bookings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Bookings</CardTitle>
              <CardDescription>User's booking history</CardDescription>
            </CardHeader>
            <CardContent>
              {user.bookings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No bookings found
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.bookings.map((booking: any) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{booking.itemType}</p>
                            <p className="text-sm text-gray-500">
                              {booking.itemId}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(booking.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>${booking.totalPrice}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              booking.status === "Confirmed"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              booking.status === "Confirmed"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : booking.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                  : "bg-red-100 text-red-700 border-red-200"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Reviews</CardTitle>
              <CardDescription>User's review activity</CardDescription>
            </CardHeader>
            <CardContent>
              {user.reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No reviews found
                </p>
              ) : (
                <div className="space-y-4">
                  {user.reviews.map((review: any) => (
                    <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Auth Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Authentication Events</CardTitle>
              <CardDescription>
                Recent login and security events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.authEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No auth events found
                </p>
              ) : (
                <div className="space-y-3">
                  {user.authEvents.map((event: any) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{event.event}</p>
                        <p className="text-xs text-gray-500">
                          {event.provider || "Unknown provider"}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={event.success ? "default" : "destructive"}
                          className={
                            event.success
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-red-100 text-red-700 border-red-200"
                          }
                        >
                          {event.success ? "Success" : "Failed"}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(event.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
