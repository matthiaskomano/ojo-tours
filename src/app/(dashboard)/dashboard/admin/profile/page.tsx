"use client";

import { useState, useEffect } from "react";
import { getProfile, updateProfile } from "@/actions/profileActions";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Save,
  ArrowLeft,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      const data = await getProfile();
      if (data) {
        setProfile(data);
        setAvatarUrl(data.avatar || "");
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      formData.set("avatar", avatarUrl);
      await updateProfile(formData);
      router.refresh();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="text-center py-16">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="text-center py-16">
          <p className="text-gray-500">Failed to load profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Profile Settings
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage your account information and preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mb-4">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {profile.fullName || profile.email.split("@")[0]}
              </h2>
              <p className="text-sm text-gray-500">{profile.email}</p>
              <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
                <Shield className="h-4 w-4 mr-1" />
                {profile.role?.name || "User"}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <span>
                  Joined{" "}
                  {new Date(profile.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                <span>{profile.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Edit Profile
            </h2>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label
                  htmlFor="emergencyContact"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  id="emergencyContact"
                  name="emergencyContact"
                  defaultValue={profile.emergencyContact || ""}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all"
                  placeholder="Enter emergency contact name"
                />
              </div>

              <div>
                <label
                  htmlFor="emergencyPhone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  id="emergencyPhone"
                  name="emergencyPhone"
                  defaultValue={profile.emergencyPhone || ""}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all"
                  placeholder="Enter emergency contact phone"
                />
              </div>

              <div>
                <label
                  htmlFor="preferences"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Preferences
                </label>
                <textarea
                  id="preferences"
                  name="preferences"
                  defaultValue={profile.preferences || ""}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Enter your preferences (e.g., dietary restrictions, accessibility needs, etc.)"
                />
              </div>

              <div>
                <FileUpload
                  label="Profile Picture"
                  fileType="image"
                  subfolder="avatars"
                  value={avatarUrl}
                  onChange={setAvatarUrl}
                  accept="image/*"
                  maxSize={2 * 1024 * 1024}
                />
              </div>

              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
                <Link href="/dashboard/admin">
                  <Button
                    variant="outline"
                    className="text-black cursor-pointer"
                  >
                    Cancel
                  </Button>
                </Link>
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
      </div>
    </div>
  );
}
