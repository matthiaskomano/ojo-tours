import { getCurrentUserWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StaffProfilePage() {
  const user = await getCurrentUserWithRole();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Profile
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Manage your profile information
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName || user.email}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-500 to-blue-600 text-white text-2xl font-bold">
                {(user.fullName || user.email)[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {user.fullName || "No name set"}
            </h2>
            <p className="text-gray-500">{user.email}</p>
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user.role?.name || "STAFF"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Email
              </label>
              <p className="text-sm text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Role
              </label>
              <p className="text-sm text-gray-900">
                {user.role?.name || "STAFF"}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Account Status
              </label>
              <p className="text-sm text-gray-900">
                {user.isActive ? "Active" : "Inactive"}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Email Verified
              </label>
              <p className="text-sm text-gray-900">
                {user.emailVerified ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
