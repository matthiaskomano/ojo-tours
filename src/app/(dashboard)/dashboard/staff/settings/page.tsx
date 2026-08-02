import { getSettings } from "@/actions/settingsActions";
import { Globe, Mail, Phone, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StaffSettingsPage() {
  const settings = await getSettings();

  if (!settings) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="text-center py-16">
          <p className="text-gray-500">Failed to load settings.</p>
        </div>
      </div>
    );
  }

  const socialLinks = (settings.socialLinks as Record<string, string>) || {};

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Site Settings
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          View site-wide configuration and contact information
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <svg
          className="w-5 h-5 text-amber-600 mt-0.5 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        <div>
          <p className="text-sm font-semibold text-amber-900">
            Read-Only Access
          </p>
          <p className="text-xs text-amber-700 mt-1">
            You can view settings but cannot modify them. Contact an
            administrator for changes.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        {/* General Settings */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5" />
            General Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Name
              </label>
              <p className="text-gray-900">{settings.siteName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Description
              </label>
              <p className="text-gray-900">
                {settings.siteDescription || "Not set"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Keywords
              </label>
              <p className="text-gray-900">
                {settings.seoKeywords || "Not set"}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <p className="text-gray-900">
                {settings.contactEmail || "Not set"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone
              </label>
              <p className="text-gray-900">
                {settings.contactPhone || "Not set"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Address
              </label>
              <p className="text-gray-900">
                {settings.contactAddress || "Not set"}
              </p>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Social Media Links
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook URL
              </label>
              <p className="text-gray-900">
                {socialLinks.facebook || "Not set"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter URL
              </label>
              <p className="text-gray-900">
                {socialLinks.twitter || "Not set"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram URL
              </label>
              <p className="text-gray-900">
                {socialLinks.instagram || "Not set"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn URL
              </label>
              <p className="text-gray-900">
                {socialLinks.linkedin || "Not set"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
