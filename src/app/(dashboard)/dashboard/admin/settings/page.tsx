import { getSettings } from "@/actions/settingsActions";
import { updateSettings } from "@/actions/settingsActions";
import { Button } from "@/components/ui/button";
import { Save, Globe, Mail, Phone, MapPin } from "lucide-react";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaXTwitter,
} from "react-icons/fa6";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
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
          Manage your site-wide configuration and contact information
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <form action={updateSettings} className="space-y-8">
          {/* General Settings */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5" />
              General Information
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="siteName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Site Name *
                </label>
                <input
                  type="text"
                  id="siteName"
                  name="siteName"
                  defaultValue={settings.siteName}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="siteDescription"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Site Description
                </label>
                <textarea
                  id="siteDescription"
                  name="siteDescription"
                  defaultValue={settings.siteDescription || ""}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label
                  htmlFor="seoKeywords"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  SEO Keywords
                </label>
                <textarea
                  id="seoKeywords"
                  name="seoKeywords"
                  defaultValue={settings.seoKeywords || ""}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Comma-separated keywords for SEO"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="contactEmail"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Contact Email
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  defaultValue={settings.contactEmail || ""}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="contactPhone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Contact Phone
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  defaultValue={settings.contactPhone || ""}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="contactAddress"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Contact Address
                </label>
                <textarea
                  id="contactAddress"
                  name="contactAddress"
                  defaultValue={settings.contactAddress || ""}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaXTwitter className="h-5 w-5" />
              Social Media Links
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="facebook"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <FaFacebook className="h-4 w-4 inline mr-2" />
                  Facebook URL
                </label>
                <input
                  type="url"
                  id="facebook"
                  name="facebook"
                  defaultValue={socialLinks.facebook || ""}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="twitter"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <FaTwitter className="h-4 w-4 inline mr-2" />
                  Twitter URL
                </label>
                <input
                  type="url"
                  id="twitter"
                  name="twitter"
                  defaultValue={socialLinks.twitter || ""}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="instagram"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <FaInstagram className="h-4 w-4 inline mr-2" />
                  Instagram URL
                </label>
                <input
                  type="url"
                  id="instagram"
                  name="instagram"
                  defaultValue={socialLinks.instagram || ""}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="linkedin"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <FaLinkedin className="h-4 w-4 inline mr-2" />
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  defaultValue={socialLinks.linkedin || ""}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-gold text-black focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              System Settings
            </h2>
            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                name="maintenanceMode"
                defaultChecked={settings.maintenanceMode}
                className="w-5 h-5 text-primary-gold border-gray-300 rounded focus:ring-primary-gold"
              />
              <div>
                <span className="text-sm font-medium text-gray-900 block">
                  Maintenance Mode
                </span>
                <span className="text-xs text-gray-500">
                  Enable to temporarily disable public access to the site
                </span>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
            <Button
              type="submit"
              className="bg-linear-to-r from-[#d4af37] to-[#d3b673] hover:opacity-90 text-white cursor-pointer"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
