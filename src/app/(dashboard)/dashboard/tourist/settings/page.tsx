"use client";

import { useState, useEffect } from "react";
import { getProfile, updateProfile } from "@/actions/profileActions";
import { Button } from "@/components/ui/button";
import { Settings2Icon, User, Mail, Phone, Shield, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TouristSettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      const data = await getProfile();
      if (data) {
        setProfile(data);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      await updateProfile(formData);
      router.refresh();
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Failed to update settings. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="text-center py-16">
          <p className="text-gray-800">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="text-center py-16">
          <p className="text-gray-800">Failed to load settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tourist">
          <Button variant="ghost" size="sm" className="text-black">
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Account Settings
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage your account preferences and information
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Info Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#d4af37] to-[#d3b673] flex items-center justify-center shadow-sm">
                <User className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Personal Information
              </h2>
            </div>
            <form action={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  defaultValue={profile.fullName || ""}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] text-black focus:border-transparent outline-none transition-all"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-black cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  defaultValue={profile.phone || ""}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4af37] text-black focus:border-transparent outline-none transition-all"
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="flex items-center justify-end pt-6 border-t border-gray-100">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-linear-to-r from-[#d4af37] to-[#d3b673] hover:opacity-90 text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Account Status Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#90caf9] to-[#047edf] flex items-center justify-center shadow-sm">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Account Status
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Role</span>
                <span className="font-medium text-gray-900">
                  {profile.role?.name || "Tourist"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span className="font-medium text-emerald-600">Active</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Member Since</span>
                <span className="font-medium text-gray-900">
                  {new Date(profile.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#84d9d2] to-[#07cdae] flex items-center justify-center shadow-sm">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Contact Support
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Need help with your account? Contact our support team.
            </p>
            <Link href="/dashboard/tourist/support">
              <Button
                variant="outline"
                className="w-full cursor-pointer text-black"
              >
                Get Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
