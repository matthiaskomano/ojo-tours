"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Home,
  Camera,
  Users,
  BookOpen,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { logoutUser } from "@/actions/authActions";
import { useRouter } from "next/navigation";

const navGroups = [
  {
    title: "Main",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard/admin",
      },
    ],
  },
  {
    title: "Content Management",
    items: [
      {
        id: "expeditions",
        label: "Expeditions",
        icon: Map,
        href: "/dashboard/admin/expeditions",
      },
      {
        id: "lodges",
        label: "Properties",
        icon: Home,
        href: "/dashboard/admin/lodges",
      },
      {
        id: "gallery",
        label: "Gallery",
        icon: Camera,
        href: "/dashboard/admin/gallery",
      },
      {
        id: "team",
        label: "Team Members",
        icon: Users,
        href: "/dashboard/admin/team",
      },
      {
        id: "journals",
        label: "Editorial",
        icon: BookOpen,
        href: "/dashboard/admin/journals",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        id: "bookings",
        label: "Bookings",
        icon: Calendar,
        href: "/dashboard/admin/bookings",
      },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard/admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1a1f2c] text-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:translate-x-0 transition-transform duration-300 ease-out z-50 ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="w-64 bg-[#1a1f2c] border-r border-white/5 h-full flex flex-col shadow-2xl">
          {/* Logo Section */}
          <div className="px-6 py-8 flex items-center gap-4 border-b border-white/10">
            <img
              src="/ojo-logo.png"
              alt="Logo"
              className="w-12 h-12 rounded-full object-cover border-2 border-[#b66dff] shadow-md"
            />
            <div>
              <p className="text-sm font-bold text-white tracking-wide">
                Admin Panel
              </p>
              <p className="text-[11px] text-[#b66dff] font-medium tracking-wider uppercase mt-0.5">
                OJO Tours
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
            {navGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          active
                            ? "text-white bg-linear-to-r from-[#da8cff]/20 to-[#9a55ff]/20 border border-[#b66dff]/30 shadow-sm"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Icon
                          size={18}
                          className={
                            active ? "text-[#b66dff]" : "text-gray-500"
                          }
                        />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 space-y-1">
            <Link
              href="/dashboard/admin/settings"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              <Settings size={18} className="text-gray-500" />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut size={18} className="text-gray-500" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
